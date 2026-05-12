type Props = {
  action: string;
  onConfirm: (action: string) => void;
};

export default function ConfirmActions({ action, onConfirm }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onConfirm("continue")}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ background: "var(--primary)" }}
      >
        确认并继续
      </button>
      <button
        onClick={() => onConfirm("modify")}
        className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
          background: "var(--surface)",
        }}
      >
        需要修改
      </button>
    </div>
  );
}
