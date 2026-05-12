import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ project });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  return Response.json({ ok: true });
}
