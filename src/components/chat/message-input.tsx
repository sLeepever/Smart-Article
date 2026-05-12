"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  return (
    <div
      className="border-t px-4 py-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div
        className="flex items-end gap-2 rounded-xl border px-3 py-2"
        style={{ borderColor: "var(--border)", background: "var(--background)" }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "等待响应中..." : "输入消息... (Enter 发送，Shift+Enter 换行)"}
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed disabled:opacity-50"
          style={{
            color: "var(--foreground)",
            minHeight: "24px",
            maxHeight: "200px",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{
            background: disabled || !value.trim() ? "var(--border)" : "var(--primary)",
            color: "white",
          }}
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-xs text-center mt-1.5" style={{ color: "var(--text-secondary)" }}>
        Smart Article 可能会犯错，重要内容请自行核实
      </p>
    </div>
  );
}
