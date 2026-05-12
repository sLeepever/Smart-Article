import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { db } from "@/db";
import { projects, chapters, literatureCache } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function exportProjectToDocx(projectId: string): Promise<Buffer> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) throw new Error("Project not found");

  const chapterRows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.projectId, projectId));
  chapterRows.sort((a, b) => a.chapterNumber - b.chapterNumber);

  const refs = await db
    .select()
    .from(literatureCache)
    .where(eq(literatureCache.projectId, projectId));

  const children: Paragraph[] = [];

  // Title
  if (project.topic) {
    children.push(
      new Paragraph({
        text: project.topic,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(new Paragraph({ text: "" }));
  }

  // Chapters
  for (const chapter of chapterRows) {
    const content = chapter.contentRewritten ?? chapter.content ?? "";
    const lines = content.split("\n");

    children.push(
      new Paragraph({
        text: `${chapter.title}`,
        heading: HeadingLevel.HEADING_1,
      })
    );

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        children.push(new Paragraph({ text: "" }));
        continue;
      }

      if (trimmed.startsWith("## ")) {
        children.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2 }));
      } else if (trimmed.startsWith("### ")) {
        children.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3 }));
      } else if (trimmed.startsWith("# ")) {
        children.push(new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1 }));
      } else {
        children.push(new Paragraph({ children: [new TextRun(trimmed)] }));
      }
    }

    children.push(new Paragraph({ text: "" }));
  }

  // References
  if (refs.length > 0) {
    children.push(new Paragraph({ text: "参考文献", heading: HeadingLevel.HEADING_1 }));
    refs.forEach((ref, i) => {
      const authors = JSON.parse(ref.authorsJson ?? "[]") as string[];
      const authorStr = authors.slice(0, 3).join(", ") + (authors.length > 3 ? ", 等" : "");
      const refText = `[${i + 1}] ${authorStr}. ${ref.title}${ref.year ? `. ${ref.year}` : ""}${ref.venue ? `. ${ref.venue}` : ""}${ref.doi ? `. https://doi.org/${ref.doi}` : ""}`;
      children.push(new Paragraph({ children: [new TextRun({ text: refText, size: 20 })] }));
    });
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
