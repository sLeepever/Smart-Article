import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { REVIEW_PROMPT } from "./prompt";
import { getChaptersTool, getReferencesForReviewTool } from "./tools";

export function createReviewAgent(llm: BaseChatModel) {
  return createReactAgent({
    llm,
    tools: [getChaptersTool, getReferencesForReviewTool],
    name: "review_agent",
    prompt: REVIEW_PROMPT,
  });
}
