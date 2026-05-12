"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import ProjectList from "./project-list";
import { Settings, LogOut, Plus } from "lucide-react";
import Link from "next/link";

export default function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
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
        <Link
          href="/chat"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--primary-light)", color: "var(--primary)" }}
        >
          <Plus size={16} />
          新建论文项目
        </Link>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-xs font-medium px-1 mb-2" style={{ color: "var(--text-secondary)" }}>
          历史项目
        </p>
        <ProjectList />
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
