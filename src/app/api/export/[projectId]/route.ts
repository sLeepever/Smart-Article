import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { exportProjectToDocx } from "@/services/docx-exporter";
import { headers } from "next/headers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const [project] = await db
    .select({ id: projects.id, topic: projects.topic })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const buffer = await exportProjectToDocx(projectId);
  const filename = encodeURIComponent((project.topic ?? "论文") + ".docx");

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
