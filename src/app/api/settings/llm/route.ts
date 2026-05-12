import { auth } from "@/lib/auth";
import { db } from "@/db";
import { llmConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { encrypt } from "@/lib/crypto";
import { headers } from "next/headers";
import type { LLMProviderType } from "@/lib/constants";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const configs = await db
    .select({
      id: llmConfigs.id,
      name: llmConfigs.name,
      providerType: llmConfigs.providerType,
      baseUrl: llmConfigs.baseUrl,
      modelName: llmConfigs.modelName,
      isDefault: llmConfigs.isDefault,
      createdAt: llmConfigs.createdAt,
    })
    .from(llmConfigs)
    .where(eq(llmConfigs.userId, session.user.id));

  return Response.json({ configs });
}

// POST: create new config
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, providerType, baseUrl, apiKey, modelName } = body as {
    name: string;
    providerType: LLMProviderType;
    baseUrl: string;
    apiKey: string;
    modelName: string;
  };

  if (!name?.trim() || !providerType || !baseUrl || !apiKey || !modelName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { encrypted, iv } = encrypt(apiKey);

  // If this is the first config, make it default
  const existing = await db
    .select({ id: llmConfigs.id })
    .from(llmConfigs)
    .where(eq(llmConfigs.userId, session.user.id));

  const id = nanoid();
  await db.insert(llmConfigs).values({
    id,
    userId: session.user.id,
    name: name.trim(),
    providerType,
    baseUrl,
    apiKeyEnc: encrypted,
    apiKeyIv: iv,
    modelName,
    isDefault: existing.length === 0,
  });

  return Response.json({ ok: true, id }, { status: 201 });
}

// PUT: update existing config by id
export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, providerType, baseUrl, apiKey, modelName, isDefault } = body as {
    id: string;
    name?: string;
    providerType?: LLMProviderType;
    baseUrl?: string;
    apiKey?: string;
    modelName?: string;
    isDefault?: boolean;
  };

  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const [existing] = await db
    .select({ id: llmConfigs.id })
    .from(llmConfigs)
    .where(and(eq(llmConfigs.id, id), eq(llmConfigs.userId, session.user.id)));

  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  // If setting as default, unset all others first
  if (isDefault) {
    await db
      .update(llmConfigs)
      .set({ isDefault: false })
      .where(eq(llmConfigs.userId, session.user.id));
  }

  const updatePayload: Record<string, unknown> = {};
  if (name?.trim()) updatePayload.name = name.trim();
  if (providerType) updatePayload.providerType = providerType;
  if (baseUrl) updatePayload.baseUrl = baseUrl;
  if (modelName) updatePayload.modelName = modelName;
  if (isDefault !== undefined) updatePayload.isDefault = isDefault;
  if (apiKey) {
    const { encrypted, iv } = encrypt(apiKey);
    updatePayload.apiKeyEnc = encrypted;
    updatePayload.apiKeyIv = iv;
  }

  await db.update(llmConfigs).set(updatePayload).where(eq(llmConfigs.id, id));

  return Response.json({ ok: true });
}
