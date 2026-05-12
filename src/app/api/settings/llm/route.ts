import { auth } from "@/lib/auth";
import { db } from "@/db";
import { llmConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { encrypt, decrypt } from "@/lib/crypto";
import { headers } from "next/headers";
import type { LLMProviderType } from "@/lib/constants";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [config] = await db
    .select()
    .from(llmConfigs)
    .where(eq(llmConfigs.userId, session.user.id));

  if (!config) return Response.json({ config: null });

  return Response.json({
    config: {
      id: config.id,
      providerType: config.providerType,
      baseUrl: config.baseUrl,
      modelName: config.modelName,
      hasApiKey: true,
    },
  });
}

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { providerType, baseUrl, apiKey, modelName } = body as {
    providerType: LLMProviderType;
    baseUrl: string;
    apiKey: string;
    modelName: string;
  };

  if (!providerType || !baseUrl || !apiKey || !modelName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { encrypted, iv } = encrypt(apiKey);

  const [existing] = await db
    .select({ id: llmConfigs.id })
    .from(llmConfigs)
    .where(eq(llmConfigs.userId, session.user.id));

  if (existing) {
    await db
      .update(llmConfigs)
      .set({ providerType, baseUrl, apiKeyEnc: encrypted, apiKeyIv: iv, modelName })
      .where(eq(llmConfigs.userId, session.user.id));
  } else {
    await db.insert(llmConfigs).values({
      id: nanoid(),
      userId: session.user.id,
      providerType,
      baseUrl,
      apiKeyEnc: encrypted,
      apiKeyIv: iv,
      modelName,
    });
  }

  return Response.json({ ok: true });
}
