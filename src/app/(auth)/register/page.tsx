"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp.email({ name, email, password });

    if (result.error) {
      setError(result.error.message ?? "注册失败，请重试");
      setLoading(false);
      return;
    }

    router.push("/chat");
  }

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--foreground)" }}>
        创建账号
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
            昵称
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
            邮箱
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
            密码
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
          style={{ background: loading ? "var(--text-secondary)" : "var(--primary)" }}
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        已有账号？{" "}
        <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
          登录
        </Link>
      </p>
    </>
  );
}
