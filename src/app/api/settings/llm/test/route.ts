import { auth } from "@/lib/auth";
import { db } from "@/db";
import { llmConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { createLLMFromConfig } from "@/agents/llm-factory";
import { headers } from "next/headers";
import type { LLMProviderType } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Prefer params from request body (test before saving)
  const body = await req.json().catch(() => ({}));
  const { providerType, baseUrl, apiKey, modelName } = body as {
    providerType?: LLMProviderType;
    baseUrl?: string;
    apiKey?: string;
    modelName?: string;
  };

  let resolvedProviderType: LLMProviderType;
  let resolvedBaseUrl: string;
  let resolvedApiKey: string;
  let resolvedModelName: string;

  if (providerType && baseUrl && apiKey && modelName) {
    resolvedProviderType = providerType;
    resolvedBaseUrl = baseUrl;
    resolvedApiKey = apiKey;
    resolvedModelName = modelName;
  } else {
    // Fall back to saved config
    const [config] = await db
      .select()
      .from(llmConfigs)
      .where(eq(llmConfigs.userId, session.user.id));

    if (!config) {
      return Response.json({ ok: false, message: "未找到 LLM 配置，请先填写并保存配置" });
    }

    resolvedProviderType = config.providerType as LLMProviderType;
    resolvedBaseUrl = config.baseUrl;
    resolvedApiKey = decrypt(config.apiKeyEnc, config.apiKeyIv);
    resolvedModelName = config.modelName;
  }

  try {
    const llm = createLLMFromConfig({
      providerType: resolvedProviderType,
      baseUrl: resolvedBaseUrl,
      apiKey: resolvedApiKey,
      modelName: resolvedModelName,
    });

    await llm.invoke([{ role: "user", content: "Hi" }]);
    return Response.json({ ok: true, message: "连接成功" });
  } catch (err) {
    let message = "连接失败";
    if (err instanceof Error) {
      // Extract meaningful message, strip verbose stack/JSON
      const raw = err.message;
      // Try to find HTTP status code and message
      const statusMatch = raw.match(/(\d{3})/);
      const status = statusMatch ? statusMatch[1] : null;
      if (status) {
        message = `连接失败（HTTP ${status}）：`;
        if (raw.includes("401") || raw.includes("Unauthorized")) {
          message += "API Key 无效或未授权";
        } else if (raw.includes("404") || raw.includes("Not Found")) {
          message += "接口地址不存在，请检查 Base URL 和模型名称";
        } else if (raw.includes("429") || raw.includes("rate limit")) {
          message += "请求频率超限";
        } else if (raw.includes("model") || raw.includes("Model")) {
          message += "模型名称不存在或无权限使用";
        } else {
          message += raw.slice(0, 200);
        }
      } else if (raw.includes("ECONNREFUSED") || raw.includes("fetch failed")) {
        message = `连接失败：无法连接到 ${resolvedBaseUrl}，请检查 Base URL 是否正确`;
      } else if (raw.includes("ENOTFOUND") || raw.includes("getaddrinfo")) {
        message = "连接失败：域名解析失败，请检查 Base URL";
      } else {
        message = `连接失败：${raw.slice(0, 300)}`;
      }
    }
    return Response.json({ ok: false, message });
  }
}

