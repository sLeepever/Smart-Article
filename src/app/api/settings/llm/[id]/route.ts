import { auth } from "@/lib/auth";
import { db } from "@/db";
import { llmConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [config] = await db
    .select({ id: llmConfigs.id, isDefault: llmConfigs.isDefault })
    .from(llmConfigs)
    .where(and(eq(llmConfigs.id, id), eq(llmConfigs.userId, session.user.id)));

  if (!config) return Response.json({ error: "Not found" }, { status: 404 });

  await db.delete(llmConfigs).where(eq(llmConfigs.id, id));

  // If we deleted the default, promote the next config
  if (config.isDefault) {
    const [next] = await db
      .select({ id: llmConfigs.id })
      .from(llmConfigs)
      .where(eq(llmConfigs.userId, session.user.id));
    if (next) {
      await db.update(llmConfigs).set({ isDefault: true }).where(eq(llmConfigs.id, next.id));
    }
  }

  return Response.json({ ok: true });
}
