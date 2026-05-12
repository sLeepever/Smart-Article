"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";
import { LLM_PROVIDER_TYPES } from "@/lib/constants";
import type { LLMProviderType } from "@/lib/constants";

type LLMConfig = {
  id: string;
  name: string;
  providerType: LLMProviderType;
  modelName: string;
  isDefault: boolean;
};

type Props = {
  onSend: (message: string, llmConfigId?: string) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings/llm", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const list: LLMConfig[] = data.configs ?? [];
        setConfigs(list);
        const def = list.find((c) => c.isDefault) ?? list[0];
        if (def) setSelectedId(def.id);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, selectedId ?? undefined);
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

  const selected = configs.find((c) => c.id === selectedId);

  return (
    <div
      className="border-t px-4 py-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* Model selector */}
      {configs.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors"
              style={{
                borderColor: "var(--border)",
                background: "var(--background)",
                color: "var(--text-secondary)",
              }}
            >
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                {selected ? selected.name : "选择模型"}
              </span>
              {selected && (
                <span style={{ color: "var(--text-secondary)" }}>
                  · {LLM_PROVIDER_TYPES[selected.providerType]} / {selected.modelName}
                </span>
              )}
              <ChevronDown size={12} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute bottom-full mb-1 left-0 rounded-xl border shadow-lg z-50 min-w-56 overflow-hidden"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {configs.map((cfg) => (
                  <button
                    key={cfg.id}
                    onClick={() => { setSelectedId(cfg.id); setDropdownOpen(false); }}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:opacity-80"
                    style={{
                      background: cfg.id === selectedId ? "var(--primary-light)" : "transparent",
                      color: cfg.id === selectedId ? "var(--primary)" : "var(--foreground)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium truncate">{cfg.name}</span>
                        {cfg.isDefault && (
                          <span
                            className="text-xs px-1 py-0 rounded shrink-0"
                            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                          >
                            默认
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                        {LLM_PROVIDER_TYPES[cfg.providerType]} · {cfg.modelName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
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
