import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messages, projects } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  // Verify ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.projectId, projectId))
    .orderBy(asc(messages.createdAt));

  return Response.json({ messages: rows });
}
