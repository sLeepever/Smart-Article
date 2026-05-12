"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProjectList from "./project-list";
import { useSidebarRefresh } from "./sidebar-refresh-context";
import { Settings, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export default function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { refreshKey, triggerRefresh } = useSidebarRefresh();
  const [creating, setCreating] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  async function handleNewProject() {
    if (creating) return;
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新论文项目" }),
    });
    if (res.ok) {
      const data = await res.json();
      triggerRefresh();
      router.push(`/chat/${data.project.id}`);
    }
    setCreating(false);
  }

  return (
    <aside
      className="w-64 h-full flex flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
          Smart Article
        </span>
      </div>

      {/* New project button */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewProject}
          disabled={creating}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          style={{ background: "var(--primary-light)", color: "var(--primary)" }}
        >
          <Plus size={16} />
          {creating ? "创建中..." : "新建论文项目"}
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-xs font-medium px-1 mb-2" style={{ color: "var(--text-secondary)" }}>
          历史项目
        </p>
        <ProjectList refreshKey={refreshKey} />
      </div>

      {/* Footer */}
      <div
        className="px-3 py-3 border-t space-y-1"
        style={{ borderColor: "var(--border)" }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50"
          style={{ color: "var(--text-secondary)" }}
        >
          <Settings size={15} />
          设置
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 text-left"
          style={{ color: "var(--text-secondary)" }}
        >
          <LogOut size={15} />
          退出登录 {session?.user?.name ? `(${session.user.name})` : ""}
        </button>
      </div>
    </aside>
  );
}

