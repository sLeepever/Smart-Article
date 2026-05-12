export default function StatusIndicator({ message }: { message: string }) {
  return (
    <div className="flex justify-center">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{
          background: "var(--accent)",
          color: "var(--text-secondary)",
          border: "1px solid var(--accent-border)",
        }}
      >
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full animate-bounce"
              style={{
                background: "var(--primary)",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </span>
        <span className="status-dots">{message}</span>
      </div>
    </div>
  );
}
