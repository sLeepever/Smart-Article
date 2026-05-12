import { auth } from "@/lib/auth";
import { db } from "@/db";
import { llmConfigs, messages, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { createLLMFromConfig } from "@/agents/llm-factory";
import { buildSupervisorGraph } from "@/agents/supervisor";
import { HumanMessage } from "@langchain/core/messages";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { TOOL_STATUS_MESSAGES } from "@/lib/constants";
import type { LLMProviderType } from "@/lib/constants";

const DEFAULT_TITLE = "新论文项目";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, message } = body as { projectId: string; message: string };

  if (!projectId || !message?.trim()) {
    return Response.json({ error: "Missing projectId or message" }, { status: 400 });
  }

  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  // Load LLM config
  const [config] = await db
    .select()
    .from(llmConfigs)
    .where(eq(llmConfigs.userId, session.user.id));

  if (!config) {
    return Response.json({ error: "请先在设置页面配置 LLM 供应商" }, { status: 400 });
  }

  // Save user message to DB
  await db.insert(messages).values({
    id: nanoid(),
    projectId,
    role: "user",
    content: message,
    messageType: "text",
  });

  // Build SSE stream
  const encoder = new TextEncoder();
  let fullAssistantMessage = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const apiKey = decrypt(config.apiKeyEnc, config.apiKeyIv);
        const llm = createLLMFromConfig({
          providerType: config.providerType as LLMProviderType,
          baseUrl: config.baseUrl,
          apiKey,
          modelName: config.modelName,
        });

        const graph = buildSupervisorGraph(llm, session.user.id);

        const graphStream = await graph.stream(
          { messages: [new HumanMessage(message)] },
          {
            streamMode: "messages",
            configurable: { thread_id: projectId },
            recursionLimit: 150,
          }
        );

        for await (const [chunk, metadata] of graphStream) {
          const agentName = (metadata as { langgraph_node?: string })?.langgraph_node ?? "supervisor";

          // Only stream tokens from the supervisor/orchestrator node
          // Sub-agent outputs (literature_agent, writing_agent, etc.) are internal;
          // the supervisor will summarize them in its own reply.
          if (agentName !== "supervisor") continue;

          // Tool call status messages
          if (chunk.tool_calls && Array.isArray(chunk.tool_calls) && chunk.tool_calls.length > 0) {
            const toolName = (chunk.tool_calls[0] as { name: string }).name;
            const statusMsg = TOOL_STATUS_MESSAGES[toolName];
            if (statusMsg) {
              send({ type: "status", content: statusMsg });
            }
            continue;
          }

          // Text content tokens
          if (chunk.content) {
            const text = typeof chunk.content === "string"
              ? chunk.content
              : Array.isArray(chunk.content)
                ? chunk.content.map((c: unknown) => (typeof c === "object" && c !== null && "text" in c) ? (c as {text: string}).text : "").join("")
                : "";

            // Filter out LangGraph internal handoff messages
            if (text && !text.includes("Successfully transferred")) {
              fullAssistantMessage += text;
              send({ type: "token", content: text, agent: agentName });
            }
          }
        }

        // Save full assistant message to DB
        if (fullAssistantMessage.trim()) {
          const messageType = detectMessageType(fullAssistantMessage);
          await db.insert(messages).values({
            id: nanoid(),
            projectId,
            role: "assistant",
            content: fullAssistantMessage,
            messageType,
          });
        }

        // Sync project title from topic (set by orchestrator) or first user message
        const [latestProject] = await db
          .select({ title: projects.title, topic: projects.topic })
          .from(projects)
          .where(eq(projects.id, projectId));

        if (latestProject) {
          if (latestProject.topic) {
            await db.update(projects)
              .set({ title: latestProject.topic })
              .where(eq(projects.id, projectId));
          } else if (latestProject.title === DEFAULT_TITLE) {
            const trimmed = message.trim().slice(0, 20);
            if (trimmed) {
              await db.update(projects)
                .set({ title: trimmed })
                .where(eq(projects.id, projectId));
            }
          }
        }

        send({ type: "done" });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "发生未知错误";
        send({ type: "error", content: `Agent 执行出错：${errorMsg}` });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function detectMessageType(content: string): string {
  if (content.includes("<literature-list>")) return "literature_list";
  if (content.includes("<outline>")) return "outline";
  if (content.includes("<chapter ")) return "chapter";
  if (content.includes("<review-report>")) return "review_report";
  if (content.includes("<aigc-comparison")) return "aigc_comparison";
  if (content.includes("<confirm ")) return "confirm_prompt";
  if (content.includes("<download-ready")) return "download_link";
  return "text";
}
