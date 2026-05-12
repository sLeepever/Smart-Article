import { readFileSync } from "fs";
import { join } from "path";

export const ORCHESTRATOR_PROMPT = readFileSync(
  join(process.cwd(), "src/agents/orchestrator/prompt.txt"),
  "utf-8"
);
