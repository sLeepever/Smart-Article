import { tool } from "@langchain/core/tools";
import { z } from "zod";

const SS_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

export const semanticScholarSearchTool = tool(
  async ({ query, limit = 8 }) => {
    const fields = "title,abstract,authors,year,venue,externalIds,url,citationCount";
    const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
    url.searchParams.set("query", query);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", String(limit));

    const reqHeaders: Record<string, string> = { "User-Agent": "SmartArticle/1.0" };
    if (SS_API_KEY) reqHeaders["x-api-key"] = SS_API_KEY;

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: reqHeaders,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      return JSON.stringify({ error: "semantic_scholar_unavailable", message: "Semantic Scholar 连接超时，请改用 crossref_search 工具" });
    }

    if (res.status === 429) {
      return JSON.stringify({ error: "semantic_scholar_rate_limited", message: "Semantic Scholar 请求频率超限，请改用 crossref_search 工具完成本次检索" });
    }

    if (!res.ok) {
      return JSON.stringify({ error: `semantic_scholar_error_${res.status}`, message: `Semantic Scholar 返回错误 ${res.status}，请改用 crossref_search 工具` });
    }

    const data = await res.json();
    const papers = (data.data ?? []).map((p: Record<string, unknown>) => ({
      title: p.title,
      authors: Array.isArray(p.authors) ? (p.authors as Array<{name: string}>).map((a) => a.name) : [],
      year: p.year,
      venue: p.venue,
      abstract: typeof p.abstract === "string" ? p.abstract.slice(0, 300) : "",
      doi: (p.externalIds as Record<string, string> | null)?.DOI ?? null,
      url: p.url ?? null,
      citationCount: p.citationCount ?? 0,
      source: "semantic_scholar",
    }));

    return JSON.stringify({ papers, total: data.total });
  },
  {
    name: "semantic_scholar_search",
    description: "搜索 Semantic Scholar 学术数据库。若返回 semantic_scholar_rate_limited 或 semantic_scholar_unavailable 错误，必须立即改用 crossref_search 工具，不要重试本工具。",
    schema: z.object({
      query: z.string().describe("搜索关键词，英文效果更好"),
      limit: z.number().optional().describe("返回结果数量，默认 8，最多 15"),
    }),
  }
);

export const crossRefSearchTool = tool(
  async ({ query, limit = 8 }) => {
    const url = new URL("https://api.crossref.org/works");
    url.searchParams.set("query.bibliographic", query);
    url.searchParams.set("rows", String(limit));
    url.searchParams.set("mailto", "smartarticle@example.com");
    url.searchParams.set("select", "title,author,published,DOI,container-title,abstract,is-referenced-by-count");

    let res: Response;
    try {
      res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
    } catch {
      return JSON.stringify({ error: "crossref_timeout", message: "CrossRef 连接超时" });
    }

    if (!res.ok) return JSON.stringify({ error: `CrossRef error: ${res.status}` });

    const data = await res.json();
    const papers = (data.message?.items ?? []).map((p: Record<string, unknown>) => {
      const published = p.published as { "date-parts"?: number[][] } | null;
      const year = published?.["date-parts"]?.[0]?.[0] ?? null;
      const authors = Array.isArray(p.author)
        ? (p.author as Array<{family?: string; given?: string}>).map((a) => `${a.family ?? ""} ${a.given ?? ""}`.trim())
        : [];
      const containerTitle = Array.isArray(p["container-title"])
        ? (p["container-title"] as string[])[0]
        : "";
      return {
        title: Array.isArray(p.title) ? (p.title as string[])[0] : String(p.title ?? ""),
        authors,
        year,
        venue: containerTitle,
        abstract: typeof p.abstract === "string" ? p.abstract.slice(0, 300).replace(/<[^>]+>/g, "") : "",
        doi: p.DOI ?? null,
        url: p.DOI ? `https://doi.org/${p.DOI}` : null,
        citationCount: p["is-referenced-by-count"] ?? 0,
        source: "crossref",
      };
    });

    return JSON.stringify({ papers });
  },
  {
    name: "crossref_search",
    description: "通过 CrossRef 搜索学术文献。稳定可靠，适合搜索有 DOI 的正式出版论文。当 Semantic Scholar 不可用时优先使用此工具。",
    schema: z.object({
      query: z.string().describe("搜索关键词，英文或中文均可"),
      limit: z.number().optional().describe("返回数量，默认 8"),
    }),
  }
);

export const verifyDOITool = tool(
  async ({ doi }) => {
    const url = `https://doi.org/${doi}`;
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      return JSON.stringify({
        doi,
        valid: res.status < 400,
        status: res.status,
        url: res.url,
      });
    } catch {
      return JSON.stringify({ doi, valid: false, status: 0, error: "timeout or network error" });
    }
  },
  {
    name: "verify_doi",
    description: "验证 DOI 链接是否真实可访问。用于确保文献真实存在。DOI 验证失败的文献必须丢弃。",
    schema: z.object({
      doi: z.string().describe("DOI 字符串，例如 10.1016/j.ins.2020.01.001"),
    }),
  }
);
