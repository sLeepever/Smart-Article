"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新论文项目" }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/chat/${data.project.id}`);
    } else {
      setCreating(false);
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4" style={{ background: "var(--background)" }}>
      <div className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Smart Article
      </div>
      <p className="text-sm max-w-sm text-center" style={{ color: "var(--text-secondary)" }}>
        你好！我是你的论文写作助手。告诉我你的专业方向和想写的论文主题，我来帮你完成从文献检索到全文写作的全过程。
      </p>
      <button
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60 mt-2"
        style={{ background: "var(--primary)" }}
      >
        <Plus size={16} />
        {creating ? "创建中..." : "新建论文项目"}
      </button>
    </div>
  );
}
