"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  stage: string;
  createdAt: number;
};

export default function ProjectList({ refreshKey }: { refreshKey?: number }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const params = useParams();
  const router = useRouter();
  const currentProjectId = params?.projectId as string | undefined;

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => {});
  }, [refreshKey]);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("确定删除这个项目吗？")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) router.push("/chat");
  }

  if (projects.length === 0) {
    return (
      <p className="text-xs px-1 py-2" style={{ color: "var(--text-secondary)" }}>
        暂无项目
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/chat/${project.id}`}
          className="group flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: currentProjectId === project.id ? "var(--primary-light)" : "transparent",
            color: currentProjectId === project.id ? "var(--primary)" : "var(--foreground)",
          }}
        >
          <FileText size={14} className="shrink-0" />
          <span className="flex-1 truncate">{project.title}</span>
          <button
            onClick={(e) => handleDelete(project.id, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </Link>
      ))}
    </div>
  );
}
