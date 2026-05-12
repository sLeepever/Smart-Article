type OutlineNode = {
  number: string;
  title: string;
  sections?: OutlineNode[];
};

export default function OutlineTree({ outline }: { outline: OutlineNode[] }) {
  return (
    <div
      className="border rounded-lg p-4"
      style={{ borderColor: "var(--border)", background: "var(--background)" }}
    >
      <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
        论文大纲
      </p>
      <div className="space-y-1.5">
        {outline.map((chapter) => (
          <div key={chapter.number}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span style={{ color: "var(--primary)" }}>{chapter.number}</span>
              <span>{chapter.title}</span>
            </div>
            {chapter.sections && (
              <div className="ml-6 mt-1 space-y-1">
                {chapter.sections.map((section) => (
                  <div key={section.number} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{section.number}</span>
                    <span>{section.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
