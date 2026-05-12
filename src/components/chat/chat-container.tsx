"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MessageList from "./message-list";
import MessageInput from "./message-input";

export type Message = {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
  messageType: string;
};

type StreamEvent =
  | { type: "token"; content: string; agent: string }
  | { type: "status"; content: string }
  | { type: "done" }
  | { type: "error"; content: string };

export default function ChatContainer({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load message history
  useEffect(() => {
    fetch(`/api/projects/${projectId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) {
          setMessages(
            data.messages.map((m: {id: string; role: string; content: string; messageType: string}) => ({
              id: m.id,
              role: m.role as "user" | "assistant" | "status",
              content: m.content,
              messageType: m.messageType,
            }))
          );
        }
      })
      .catch(() => {});
  }, [projectId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        messageType: "text",
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");
      setStatusMessage("");

      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, message: content }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let event: StreamEvent;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            if (event.type === "token") {
              accumulated += event.content;
              setStreamingContent(accumulated);
              setStatusMessage("");
            } else if (event.type === "status") {
              setStatusMessage(event.content);
            } else if (event.type === "done") {
              if (accumulated.trim()) {
                const msgType = detectMessageType(accumulated);
                const assistantMsg: Message = {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: accumulated,
                  messageType: msgType,
                };
                setMessages((prev) => [...prev, assistantMsg]);
              }
              setStreamingContent("");
              setStatusMessage("");
            } else if (event.type === "error") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `error-${Date.now()}`,
                  role: "assistant",
                  content: event.content,
                  messageType: "text",
                },
              ]);
              setStreamingContent("");
              setStatusMessage("");
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: "网络错误，请重试。",
              messageType: "text",
            },
          ]);
        }
        setStreamingContent("");
        setStatusMessage("");
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [projectId, isStreaming]
  );

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--background)" }}>
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        statusMessage={statusMessage}
        onConfirm={(action) => sendMessage(action === "continue" ? "确认，继续下一步" : "我需要修改")}
      />
      <MessageInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
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
