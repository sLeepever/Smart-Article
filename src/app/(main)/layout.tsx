"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarRefreshProvider } from "@/components/sidebar/sidebar-refresh-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          加载中...
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarRefreshProvider>
      <div className="h-full flex" style={{ background: "var(--background)" }}>
        <AppSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SidebarRefreshProvider>
  );
}
