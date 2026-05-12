import { ExternalLink } from "lucide-react";

type Paper = {
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  abstract: string | null;
  doi: string | null;
  url: string | null;
  citationCount: number | null;
};

export default function LiteratureCard({ papers }: { papers: Paper[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
        检索到 {papers.length} 篇文献
      </p>
      {papers.map((paper, i) => (
        <div
          key={i}
          className="border rounded-lg p-3 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-snug mb-1">{paper.title}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {paper.authors.slice(0, 3).join(", ")}
                {paper.authors.length > 3 ? " 等" : ""}
                {paper.year ? ` · ${paper.year}` : ""}
                {paper.venue ? ` · ${paper.venue}` : ""}
                {paper.citationCount ? ` · 引用 ${paper.citationCount}` : ""}
              </p>
              {paper.abstract && (
                <p className="text-xs mt-1.5 line-clamp-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {paper.abstract}
                </p>
              )}
            </div>
            {(paper.doi || paper.url) && (
              <a
                href={paper.doi ? `https://doi.org/${paper.doi}` : paper.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-1 rounded transition-colors"
                style={{ color: "var(--primary)" }}
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
