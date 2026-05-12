import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  projectId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  userId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type AgentStateType = typeof AgentState.State;
