export default function AIGCComparison({
  original,
  rewritten,
  paragraph,
}: {
  original: string;
  rewritten: string;
  paragraph: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden text-sm" style={{ borderColor: "var(--border)" }}>
      <div className="px-3 py-2 text-xs font-medium" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
        段落 {paragraph} — 改写对比
      </div>
      <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--border)" }}>
        <div className="p-3">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>原文</p>
          <p className="leading-relaxed text-xs">{original}</p>
        </div>
        <div className="p-3" style={{ background: "var(--accent)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--primary)" }}>改写后</p>
          <p className="leading-relaxed text-xs">{rewritten}</p>
        </div>
      </div>
    </div>
  );
}
