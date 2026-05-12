import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIGC_REDUCTION_PROMPT } from "./prompt";
import { rewriteParagraphTool } from "./tools";

export function createAIGCReductionAgent(llm: BaseChatModel) {
  return createReactAgent({
    llm,
    tools: [rewriteParagraphTool],
    name: "aigc_reduction_agent",
    prompt: AIGC_REDUCTION_PROMPT,
  });
}
