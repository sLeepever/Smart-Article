import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const rewriteParagraphTool = tool(
  async ({ projectId, chapterNumber, originalParagraph, rewrittenParagraph }) => {
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(
        eq(chapters.projectId, projectId),
        eq(chapters.chapterNumber, chapterNumber)
      ));

    if (chapter) {
      const current = chapter.contentRewritten ?? chapter.content ?? "";
      const updated = current.includes(originalParagraph)
        ? current.replace(originalParagraph, rewrittenParagraph)
        : (current + "\n\n" + rewrittenParagraph);
      await db
        .update(chapters)
        .set({ contentRewritten: updated, status: "rewritten" })
        .where(eq(chapters.id, chapter.id));
    }

    return JSON.stringify({ ok: true });
  },
  {
    name: "save_rewritten_paragraph",
    description: "保存改写后的段落到数据库",
    schema: z.object({
      projectId: z.string(),
      chapterNumber: z.number(),
      originalParagraph: z.string().describe("原始段落文本"),
      rewrittenParagraph: z.string().describe("改写后的段落文本"),
    }),
  }
);
