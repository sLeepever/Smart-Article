"use client";

import { useState, useEffect } from "react";
import { LLM_PROVIDER_TYPES, LLM_DEFAULT_BASE_URLS, LLM_MODEL_SUGGESTIONS } from "@/lib/constants";
import type { LLMProviderType } from "@/lib/constants";
import { CheckCircle, XCircle, Plus, Pencil, Trash2, Star } from "lucide-react";

type LLMConfig = {
  id: string;
  name: string;
  providerType: LLMProviderType;
  baseUrl: string;
  modelName: string;
  isDefault: boolean;
};

type FormState = {
  name: string;
  providerType: LLMProviderType;
  baseUrl: string;
  apiKey: string;
  modelName: string;
};

const emptyForm = (): FormState => ({
  name: "",
  providerType: "openai_chat",
  baseUrl: LLM_DEFAULT_BASE_URLS["openai_chat"],
  apiKey: "",
  modelName: "gpt-4o",
});

export default function SettingsPage() {
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // null = new
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    const res = await fetch("/api/settings/llm", { cache: "no-store" });
    const data = await res.json();
    setConfigs(data.configs ?? []);
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setTestResult(null);
    setSaved(false);
    setShowForm(true);
  }

  function openEdit(config: LLMConfig) {
    setEditingId(config.id);
    setForm({
      name: config.name,
      providerType: config.providerType,
      baseUrl: config.baseUrl,
      apiKey: "",
      modelName: config.modelName,
    });
    setTestResult(null);
    setSaved(false);
    setShowForm(true);
  }

  function handleProviderChange(type: LLMProviderType) {
    setForm((f) => ({
      ...f,
      providerType: type,
      baseUrl: LLM_DEFAULT_BASE_URLS[type],
      modelName: LLM_MODEL_SUGGESTIONS[type][0],
    }));
    setTestResult(null);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.baseUrl || !form.modelName) return;
    if (!editingId && !form.apiKey) return;

    setSaving(true);
    setSaved(false);

    if (editingId) {
      await fetch("/api/settings/llm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    } else {
      await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await loadConfigs();
    setShowForm(false);
  }

  async function handleSetDefault(id: string) {
    await fetch("/api/settings/llm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    });
    await loadConfigs();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这个配置吗？")) return;
    await fetch(`/api/settings/llm/${id}`, { method: "DELETE" });
    await loadConfigs();
    if (editingId === id) setShowForm(false);
  }

  async function handleTest() {
    if (!form.apiKey) {
      setTestResult({ ok: false, message: "请先填写 API Key" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/settings/llm/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerType: form.providerType,
        baseUrl: form.baseUrl,
        apiKey: form.apiKey,
        modelName: form.modelName,
      }),
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
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          设置
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          管理 LLM 供应商配置，在对话中可切换使用不同模型
        </p>

        {/* Config list */}
        <div className="rounded-xl border mb-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-medium" style={{ color: "var(--foreground)" }}>
              已配置的模型 ({configs.length})
            </h2>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}
            >
              <Plus size={14} />
              添加配置
            </button>
          </div>

          {configs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              暂无配置，点击"添加配置"开始
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {configs.map((cfg) => (
                <div key={cfg.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {cfg.name}
                      </span>
                      {cfg.isDefault && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0"
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
                  <div className="flex items-center gap-1 shrink-0">
                    {!cfg.isDefault && (
                      <button
                        onClick={() => handleSetDefault(cfg.id)}
                        title="设为默认"
                        className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(cfg)}
                      title="编辑"
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cfg.id)}
                      title="删除"
                      className="p-1.5 rounded-lg transition-colors hover:text-red-500"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div
            className="rounded-xl border p-6 space-y-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium" style={{ color: "var(--foreground)" }}>
                {editingId ? "编辑配置" : "添加配置"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                取消
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                配置名称
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="例如：GPT-4o 官方、Claude 中转站"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={inputStyle}
              />
            </div>

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
                      borderColor: form.providerType === key ? "var(--primary)" : "var(--border)",
                      background: form.providerType === key ? "var(--primary-light)" : "var(--background)",
                      color: form.providerType === key ? "var(--primary)" : "var(--foreground)",
                      fontWeight: form.providerType === key ? 600 : 400,
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
                value={form.baseUrl}
                onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
                style={inputStyle}
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
                API Key {editingId && <span style={{ color: "var(--text-secondary)" }}>(留空则不修改)</span>}
              </label>
              <input
                type="password"
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                placeholder={editingId ? "••••••••（留空不修改）" : "sk-..."}
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
                value={form.modelName}
                onChange={(e) => setForm((f) => ({ ...f, modelName: e.target.value }))}
                list="model-suggestions"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={inputStyle}
              />
              <datalist id="model-suggestions">
                {LLM_MODEL_SUGGESTIONS[form.providerType].map((m) => (
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
                disabled={saving || !form.name.trim() || (!editingId && !form.apiKey)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: "var(--primary)" }}
              >
                {saving ? "保存中..." : saved ? "已保存 ✓" : "保存"}
              </button>
              <button
                onClick={handleTest}
                disabled={testing || !form.apiKey}
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
        )}
      </div>
    </div>
  );
}
