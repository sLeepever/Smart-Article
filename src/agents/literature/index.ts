import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LITERATURE_PROMPT } from "./prompt";
import { semanticScholarSearchTool, crossRefSearchTool, verifyDOITool } from "./tools";

export function createLiteratureAgent(llm: BaseChatModel) {
  return createReactAgent({
    llm,
    tools: [semanticScholarSearchTool, crossRefSearchTool, verifyDOITool],
    name: "literature_agent",
    prompt: LITERATURE_PROMPT,
  });
}
