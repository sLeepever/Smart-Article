import { createSupervisor } from "@langchain/langgraph-supervisor";
import { MemorySaver } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ORCHESTRATOR_PROMPT } from "./orchestrator/prompt";
import { createLiteratureAgent } from "./literature";
import { createWritingAgent } from "./writing";
import { createReviewAgent } from "./review";
import { createAIGCReductionAgent } from "./aigc-reduction";
import {
  getProjectInfoTool,
  updateProjectInfoTool,
  saveLiteratureTool,
} from "./orchestrator/tools";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const graphCache = new Map<string, any>();

export function buildSupervisorGraph(llm: BaseChatModel, cacheKey: string) {
  if (graphCache.has(cacheKey)) {
    return graphCache.get(cacheKey);
  }

  const literatureAgent = createLiteratureAgent(llm);
  const writingAgent = createWritingAgent(llm);
  const reviewAgent = createReviewAgent(llm);
  const aigcReductionAgent = createAIGCReductionAgent(llm);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workflow = createSupervisor({
    agents: [literatureAgent, writingAgent, reviewAgent, aigcReductionAgent] as Parameters<typeof createSupervisor>[0]["agents"],
    llm,
    prompt: ORCHESTRATOR_PROMPT,
    outputMode: "last_message",
  });

  const checkpointer = new MemorySaver();
  const compiled = workflow.compile({ checkpointer });

  graphCache.set(cacheKey, compiled);
  return compiled;
}

export { getProjectInfoTool, updateProjectInfoTool, saveLiteratureTool };
