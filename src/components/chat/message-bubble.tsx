"use client";

import ReactMarkdown from "react-markdown";
import type { Message } from "./chat-container";
import LiteratureCard from "./literature-card";
import OutlineTree from "./outline-tree";
import AIGCComparison from "./aigc-comparison";
import ConfirmActions from "./confirm-actions";
import DownloadButton from "./download-button";

type Props = {
  message: Message;
  onConfirm: (action: string) => void;
  isStreaming?: boolean;
};

export default function MessageBubble({ message, onConfirm, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-lg px-4 py-3 rounded-xl text-sm"
          style={{
            background: "var(--primary)",
            color: "white",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className="max-w-3xl w-full px-4 py-3 rounded-xl text-sm border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        {renderContent(message, onConfirm, isStreaming)}
        {isStreaming && (
          <span
            className="inline-block w-0.5 h-4 ml-0.5 animate-pulse"
            style={{ background: "var(--primary)" }}
          />
        )}
      </div>
    </div>
  );
}

function renderContent(message: Message, onConfirm: (action: string) => void, isStreaming?: boolean) {
  const { content, messageType } = message;

  // Extract content between tags
  const extract = (tag: string) => {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = content.match(re);
    return match ? match[1].trim() : null;
  };

  const extractJson = (tag: string) => {
    const raw = extract(tag);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };

  switch (messageType) {
    case "literature_list": {
      const papers = extractJson("literature-list");
      const textBefore = content.split("<literature-list>")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {papers && <LiteratureCard papers={papers} />}
          {renderConfirmIfPresent(content, onConfirm)}
        </div>
      );
    }

    case "outline": {
      const outline = extractJson("outline");
      const textBefore = content.split("<outline>")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {outline && <OutlineTree outline={outline} />}
          {renderConfirmIfPresent(content, onConfirm)}
        </div>
      );
    }

    case "chapter": {
      const chapterMatch = content.match(/<chapter[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/chapter>/i);
      const textBefore = content.split("<chapter")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {chapterMatch && (
            <div
              className="border rounded-lg p-4"
              style={{ borderColor: "var(--primary-light)", background: "var(--accent)" }}
            >
              <h3 className="font-semibold mb-3 text-base" style={{ color: "var(--primary)" }}>
                {chapterMatch[1]}
              </h3>
              <div className="prose-academic">
                <MarkdownContent content={chapterMatch[2].trim()} />
              </div>
            </div>
          )}
          {renderConfirmIfPresent(content, onConfirm)}
        </div>
      );
    }

    case "review_report": {
      const report = extractJson("review-report");
      const textBefore = content.split("<review-report>")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {report && <ReviewReport items={report} />}
          {renderConfirmIfPresent(content, onConfirm)}
        </div>
      );
    }

    case "aigc_comparison": {
      const comparisons = parseAIGCComparisons(content);
      const textBefore = content.split("<aigc-comparison")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {comparisons.map((c, i) => (
            <AIGCComparison key={i} original={c.original} rewritten={c.rewritten} paragraph={c.paragraph} />
          ))}
          {renderConfirmIfPresent(content, onConfirm)}
        </div>
      );
    }

    case "confirm_prompt": {
      const confirmMatch = content.match(/<confirm[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/confirm>/i);
      const textBefore = content.split("<confirm")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {confirmMatch && (
            <>
              <p className="text-sm">{confirmMatch[2].trim()}</p>
              <ConfirmActions action={confirmMatch[1]} onConfirm={onConfirm} />
            </>
          )}
        </div>
      );
    }

    case "download_link": {
      const downloadMatch = content.match(/<download-ready[^>]*projectId="([^"]*)"[^>]*>([\s\S]*?)<\/download-ready>/i);
      const textBefore = content.split("<download-ready")[0].trim();
      return (
        <div className="space-y-3">
          {textBefore && <MarkdownContent content={textBefore} />}
          {downloadMatch && (
            <>
              <p className="text-sm">{downloadMatch[2].trim()}</p>
              <DownloadButton projectId={downloadMatch[1]} />
            </>
          )}
        </div>
      );
    }

    default:
      return <MarkdownContent content={content} />;
  }
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 mt-3" style={{ color: "var(--primary)" }}>{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3" style={{ color: "var(--primary)" }}>{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ReviewReport({ items }: { items: Array<{ item: string; status: string; note: string }> }) {
  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-2 font-medium text-sm" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
        审校报告
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <span
              className="mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: item.status === "通过" ? "#dcfce7" : "#fef3c7",
                color: item.status === "通过" ? "#15803d" : "#b45309",
              }}
            >
              {item.status}
            </span>
            <div>
              <p className="text-sm font-medium">{item.item}</p>
              {item.note && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderConfirmIfPresent(content: string, onConfirm: (action: string) => void) {
  const match = content.match(/<confirm[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/confirm>/i);
  if (!match) return null;
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>{match[2].trim()}</p>
      <ConfirmActions action={match[1]} onConfirm={onConfirm} />
    </div>
  );
}

function parseAIGCComparisons(content: string) {
  const re = /<aigc-comparison[^>]*paragraph="([^"]*)"[^>]*>\s*<original>([\s\S]*?)<\/original>\s*<rewritten>([\s\S]*?)<\/rewritten>\s*<\/aigc-comparison>/gi;
  const results: Array<{ paragraph: string; original: string; rewritten: string }> = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    results.push({ paragraph: match[1], original: match[2].trim(), rewritten: match[3].trim() });
  }
  return results;
}
