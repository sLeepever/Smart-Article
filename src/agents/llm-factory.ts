import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { LLMProviderType } from "@/lib/constants";

export type LLMConfig = {
  providerType: LLMProviderType;
  baseUrl: string;
  apiKey: string;
  modelName: string;
};

export function createLLMFromConfig(config: LLMConfig): BaseChatModel {
  const { providerType, baseUrl, apiKey, modelName } = config;

  switch (providerType) {
    case "openai_chat":
      return new ChatOpenAI({
        model: modelName,
        configuration: {
          baseURL: baseUrl,
          apiKey,
        },
        streaming: true,
      });

    case "openai_response":
      return new ChatOpenAI({
        model: modelName,
        configuration: {
          baseURL: baseUrl,
          apiKey,
        },
        streaming: true,
        useResponsesApi: true,
      });

    case "claude":
      return new ChatAnthropic({
        model: modelName,
        anthropicApiUrl: baseUrl,
        apiKey,
        streaming: true,
      });

    case "gemini":
      return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey,
        baseUrl,
        streaming: true,
      });

    default:
      throw new Error(`Unknown LLM provider type: ${providerType}`);
  }
}
