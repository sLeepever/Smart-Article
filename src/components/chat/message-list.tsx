"use client";

import { useEffect, useRef } from "react";
import type { Message } from "./chat-container";
import MessageBubble from "./message-bubble";
import StatusIndicator from "./status-indicator";

type Props = {
  messages: Message[];
  streamingContent: string;
  statusMessage: string;
  onConfirm: (action: string) => void;
};

export default function MessageList({ messages, streamingContent, statusMessage, onConfirm }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, statusMessage]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && !streamingContent && !statusMessage && (
        <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: "50vh" }}>
          <div className="text-2xl font-semibold mb-3" style={{ color: "var(--primary)" }}>
            Smart Article
          </div>
          <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
            你好！我是你的论文写作助手。告诉我你的专业方向和想写的论文主题，我来帮你完成从文献检索到全文写作的全过程。
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onConfirm={onConfirm} />
      ))}

      {statusMessage && <StatusIndicator message={statusMessage} />}

      {streamingContent && (
        <MessageBubble
          message={{
            id: "streaming",
            role: "assistant",
            content: streamingContent,
            messageType: "text",
          }}
          onConfirm={onConfirm}
          isStreaming
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
