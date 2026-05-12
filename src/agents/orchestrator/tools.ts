import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { projects, literatureCache } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ProjectStage } from "@/lib/constants";

export const getProjectInfoTool = tool(
  async ({ projectId }) => {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return JSON.stringify({ error: "Project not found" });
    return JSON.stringify({
      id: project.id,
      title: project.title,
      major: project.major,
      topic: project.topic,
      paperType: project.paperType,
      stage: project.stage,
      experimentInfo: project.experimentInfo,
      outlineJson: project.outlineJson ? JSON.parse(project.outlineJson) : null,
    });
  },
  {
    name: "get_project_info",
    description: "获取当前论文项目的基本信息和当前阶段",
    schema: z.object({ projectId: z.string() }),
  }
);

export const updateProjectInfoTool = tool(
  async ({ projectId, title, major, topic, paperType, stage, experimentInfo }) => {
    await db.update(projects).set({
      ...(title ? { title } : {}),
      ...(major ? { major } : {}),
      ...(topic ? { topic } : {}),
      ...(paperType ? { paperType } : {}),
      ...(stage ? { stage } : {}),
      ...(experimentInfo ? { experimentInfo } : {}),
    }).where(eq(projects.id, projectId));
    return JSON.stringify({ ok: true });
  },
  {
    name: "update_project_info",
    description: "更新论文项目信息（专业、主题、类型、当前阶段、实验信息等）",
    schema: z.object({
      projectId: z.string(),
      title: z.string().optional(),
      major: z.string().optional(),
      topic: z.string().optional(),
      paperType: z.string().optional(),
      stage: z.string().optional(),
      experimentInfo: z.string().optional(),
    }),
  }
);

export const saveLiteratureTool = tool(
  async ({ projectId, papers }) => {
    await db.delete(literatureCache).where(eq(literatureCache.projectId, projectId));
    for (const p of papers) {
      await db.insert(literatureCache).values({
        id: nanoid(),
        projectId,
        doi: p.doi ?? null,
        title: p.title,
        authorsJson: JSON.stringify(p.authors ?? []),
        year: p.year ?? null,
        venue: p.venue ?? null,
        abstract: p.abstract ?? null,
        url: p.url ?? null,
        citationCount: p.citationCount ?? null,
        source: p.source ?? "semantic_scholar",
        verified: p.verified ? 1 : 0,
      } as Parameters<typeof db.insert>[0] extends (table: infer _T) => { values: (v: infer V) => unknown } ? V : never);
    }
    await db.update(projects)
      .set({ referencesJson: JSON.stringify(papers), stage: "literature_search" as ProjectStage })
      .where(eq(projects.id, projectId));
    return JSON.stringify({ ok: true, count: papers.length });
  },
  {
    name: "save_literature",
    description: "保存检索到的文献列表到数据库",
    schema: z.object({
      projectId: z.string(),
      papers: z.array(z.object({
        title: z.string(),
        authors: z.array(z.string()).optional(),
        year: z.number().optional().nullable(),
        venue: z.string().optional().nullable(),
        abstract: z.string().optional().nullable(),
        doi: z.string().optional().nullable(),
        url: z.string().optional().nullable(),
        citationCount: z.number().optional().nullable(),
        source: z.string().optional(),
        verified: z.boolean().optional(),
      })),
    }),
  }
);
