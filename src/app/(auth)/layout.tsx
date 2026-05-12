export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--primary)" }}>
            Smart Article
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            智能论文写作助手
          </p>
        </div>
        <div
          className="rounded-xl p-8 shadow-sm border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
