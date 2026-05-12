import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { chapters, literatureCache } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getChaptersTool = tool(
  async ({ projectId }) => {
    const rows = await db
      .select()
      .from(chapters)
      .where(eq(chapters.projectId, projectId));

    return JSON.stringify({
      chapters: rows.map((c) => ({
        number: c.chapterNumber,
        title: c.title,
        content: c.content ?? "",
        status: c.status,
      })),
    });
  },
  {
    name: "get_chapters",
    description: "获取论文所有已撰写的章节内容，用于审校",
    schema: z.object({
      projectId: z.string().describe("论文项目 ID"),
    }),
  }
);

export const getReferencesForReviewTool = tool(
  async ({ projectId }) => {
    const refs = await db
      .select()
      .from(literatureCache)
      .where(eq(literatureCache.projectId, projectId));

    return JSON.stringify({
      references: refs.map((r, i) => ({
        number: i + 1,
        title: r.title,
        doi: r.doi,
      })),
    });
  },
  {
    name: "get_references_for_review",
    description: "获取参考文献列表用于审校引用一致性",
    schema: z.object({
      projectId: z.string(),
    }),
  }
);
