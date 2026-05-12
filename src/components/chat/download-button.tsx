"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function DownloadButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/export/${projectId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "论文.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
      style={{ background: "var(--primary)" }}
    >
      <Download size={15} />
      {loading ? "导出中..." : "下载 Word 文档"}
    </button>
  );
}
