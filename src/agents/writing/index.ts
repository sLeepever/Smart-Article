import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { WRITING_PROMPT } from "./prompt";
import { saveOutlineTool, saveChapterTool, getReferencesTool, getProjectInfoTool } from "./tools";

export function createWritingAgent(llm: BaseChatModel) {
  return createReactAgent({
    llm,
    tools: [saveOutlineTool, saveChapterTool, getReferencesTool, getProjectInfoTool],
    name: "writing_agent",
    prompt: WRITING_PROMPT,
  });
}
