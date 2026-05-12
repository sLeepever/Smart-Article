export const PROJECT_STAGES = [
  "info_gathering",
  "topic_confirmed",
  "literature_search",
  "outline_generation",
  "chapter_writing",
  "review",
  "aigc_reduction",
  "export",
  "completed",
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const STAGE_LABELS: Record<ProjectStage, string> = {
  info_gathering: "信息收集",
  topic_confirmed: "选题确认",
  literature_search: "文献检索",
  outline_generation: "大纲生成",
  chapter_writing: "章节撰写",
  review: "全文审校",
  aigc_reduction: "降 AIGC 率",
  export: "导出文档",
  completed: "已完成",
};

export const MESSAGE_TYPES = [
  "text",
  "literature_list",
  "outline",
  "chapter",
  "review_report",
  "aigc_comparison",
  "confirm_prompt",
  "download_link",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export const PAPER_TYPES = {
  graduation: "毕业论文",
  course: "课程论文",
} as const;

export type PaperType = keyof typeof PAPER_TYPES;

export const LLM_PROVIDER_TYPES = {
  openai_chat: "OpenAI Chat",
  openai_response: "OpenAI Response",
  claude: "Claude",
  gemini: "Gemini",
} as const;

export type LLMProviderType = keyof typeof LLM_PROVIDER_TYPES;

export const LLM_DEFAULT_BASE_URLS: Record<LLMProviderType, string> = {
  openai_chat: "https://api.openai.com/v1",
  openai_response: "https://api.openai.com/v1",
  claude: "https://api.anthropic.com",
  gemini: "https://generativelanguage.googleapis.com",
};

export const LLM_MODEL_SUGGESTIONS: Record<LLMProviderType, string[]> = {
  openai_chat: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  openai_response: ["o1", "o3", "o4-mini"],
  claude: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
  gemini: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-pro"],
};

export const TOOL_STATUS_MESSAGES: Record<string, string> = {
  semantic_scholar_search: "正在检索学术文献中",
  crossref_search: "正在通过 CrossRef 验证文献",
  verify_doi: "正在验证文献真实性",
  generate_outline: "正在生成论文大纲",
  write_chapter: "正在撰写章节内容",
  get_references: "正在整理参考文献",
  check_consistency: "正在审校论文逻辑",
  check_citations: "正在检查引用一致性",
  rewrite_paragraph: "正在进行降 AIGC 率改写",
  get_project_info: "正在读取项目信息",
  update_project_info: "正在保存项目进度",
};
