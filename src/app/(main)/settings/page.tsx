"use client";

import { useState, useEffect } from "react";
import { LLM_PROVIDER_TYPES, LLM_DEFAULT_BASE_URLS, LLM_MODEL_SUGGESTIONS } from "@/lib/constants";
import type { LLMProviderType } from "@/lib/constants";
import { CheckCircle, XCircle } from "lucide-react";

export default function SettingsPage() {
  const [providerType, setProviderType] = useState<LLMProviderType>("openai_chat");
  const [baseUrl, setBaseUrl] = useState(LLM_DEFAULT_BASE_URLS["openai_chat"]);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gpt-4o");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/llm")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setProviderType(data.config.providerType);
          setBaseUrl(data.config.baseUrl);
          setModelName(data.config.modelName);
        }
      });
  }, []);

  function handleProviderChange(type: LLMProviderType) {
    setProviderType(type);
    setBaseUrl(LLM_DEFAULT_BASE_URLS[type]);
    setModelName(LLM_MODEL_SUGGESTIONS[type][0]);
    setTestResult(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerType, baseUrl, apiKey, modelName }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTest() {
    if (!apiKey) {
      setTestResult({ ok: false, message: "请先填写 API Key" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/settings/llm/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerType, baseUrl, apiKey, modelName }),
    });
    const data = await res.json();
    setTestResult(data);
    setTesting(false);
  }

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-xl">
        <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          设置
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          配置 LLM 供应商以开始使用论文写作助手
        </p>

        <div
          className="rounded-xl border p-6 space-y-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="font-medium" style={{ color: "var(--foreground)" }}>
            LLM 供应商配置
          </h2>

          {/* Provider type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              API 格式
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(LLM_PROVIDER_TYPES) as [LLMProviderType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleProviderChange(key)}
                  className="px-3 py-2 rounded-lg text-sm border transition-colors text-left"
                  style={{
                    borderColor: providerType === key ? "var(--primary)" : "var(--border)",
                    background: providerType === key ? "var(--primary-light)" : "var(--background)",
                    color: providerType === key ? "var(--primary)" : "var(--foreground)",
                    fontWeight: providerType === key ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Base URL
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
              style={inputStyle}
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={inputStyle}
            />
          </div>

          {/* Model name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              模型名称
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              list="model-suggestions"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={inputStyle}
            />
            <datalist id="model-suggestions">
              {LLM_MODEL_SUGGESTIONS[providerType].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {/* Test result */}
          {testResult && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm"
              style={{
                background: testResult.ok ? "#dcfce7" : "#fef2f2",
                color: testResult.ok ? "#15803d" : "#dc2626",
              }}
            >
              <span className="shrink-0 mt-0.5">
                {testResult.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
              </span>
              <span className="break-all">{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ background: "var(--primary)" }}
            >
              {saving ? "保存中..." : saved ? "已保存" : "保存"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                background: "var(--background)",
              }}
            >
              {testing ? "测试中..." : "测试连接"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
