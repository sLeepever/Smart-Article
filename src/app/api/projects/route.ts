import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(desc(projects.updatedAt));

  return Response.json({ projects: rows });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = body.title ?? "新论文项目";

  const id = nanoid();
  await db.insert(projects).values({
    id,
    userId: session.user.id,
    title,
  });

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return Response.json({ project }, { status: 201 });
}
