import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { projects, chapters, literatureCache } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const saveOutlineTool = tool(
  async ({ projectId, outlineJson, title }) => {
    await db
      .update(projects)
      .set({
        outlineJson: JSON.stringify(outlineJson),
        title: title ?? undefined,
        stage: "outline_generation",
      })
      .where(eq(projects.id, projectId));
    return JSON.stringify({ ok: true, message: "大纲已保存" });
  },
  {
    name: "save_outline",
    description: "保存论文大纲到数据库",
    schema: z.object({
      projectId: z.string().describe("论文项目 ID"),
      title: z.string().optional().describe("论文标题"),
      outlineJson: z.array(z.object({
        number: z.string(),
        title: z.string(),
        sections: z.array(z.object({
          number: z.string(),
          title: z.string(),
        })).optional(),
      })).describe("大纲结构 JSON"),
    }),
  }
);

export const saveChapterTool = tool(
  async ({ projectId, chapterNumber, title, content }) => {
    const [existing] = await db
      .select({ id: chapters.id })
      .from(chapters)
      .where(and(eq(chapters.projectId, projectId), eq(chapters.chapterNumber, chapterNumber)));

    if (existing) {
      await db
        .update(chapters)
        .set({ title, content, status: "written" })
        .where(eq(chapters.id, existing.id));
    } else {
      await db.insert(chapters).values({
        id: nanoid(),
        projectId,
        chapterNumber,
        title,
        content,
        status: "written",
      });
    }
    return JSON.stringify({ ok: true, message: `第 ${chapterNumber} 章已保存` });
  },
  {
    name: "save_chapter",
    description: "保存论文章节内容到数据库",
    schema: z.object({
      projectId: z.string().describe("论文项目 ID"),
      chapterNumber: z.number().describe("章节编号，从 1 开始"),
      title: z.string().describe("章节标题"),
      content: z.string().describe("章节正文内容（Markdown 格式）"),
    }),
  }
);

export const getReferencesTool = tool(
  async ({ projectId }) => {
    const refs = await db
      .select()
      .from(literatureCache)
      .where(eq(literatureCache.projectId, projectId));

    return JSON.stringify({
      references: refs.map((r, i) => ({
        number: i + 1,
        title: r.title,
        authors: JSON.parse(r.authorsJson ?? "[]"),
        year: r.year,
        venue: r.venue,
        doi: r.doi,
        url: r.url,
      })),
    });
  },
  {
    name: "get_references",
    description: "获取项目已保存的参考文献列表，用于写作时正确引用",
    schema: z.object({
      projectId: z.string().describe("论文项目 ID"),
    }),
  }
);

export const getProjectInfoTool = tool(
  async ({ projectId }) => {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) return JSON.stringify({ error: "Project not found" });

    return JSON.stringify({
      title: project.title,
      major: project.major,
      topic: project.topic,
      paperType: project.paperType,
      experimentInfo: project.experimentInfo,
      stage: project.stage,
      outlineJson: project.outlineJson ? JSON.parse(project.outlineJson) : null,
    });
  },
  {
    name: "get_project_info",
    description: "获取论文项目的基本信息，包括专业、主题、实验信息和大纲",
    schema: z.object({
      projectId: z.string().describe("论文项目 ID"),
    }),
  }
);
