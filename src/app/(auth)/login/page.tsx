"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "登录失败，请检查邮箱和密码");
      setLoading(false);
      return;
    }

    router.push("/chat");
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--foreground)" }}>
        登录账号
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
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
          {loading ? "登录中..." : "登录"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        还没有账号？{" "}
        <Link href="/register" className="font-medium" style={{ color: "var(--primary)" }}>
          注册
        </Link>
      </p>
    </>
  );
}
