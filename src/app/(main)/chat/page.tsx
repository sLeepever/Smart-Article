"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const router = useRouter();

  async function createNewProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新论文项目" }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/chat/${data.project.id}`);
    }
  }

  useEffect(() => {
    createNewProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        正在创建新项目...
      </div>
    </div>
  );
}
