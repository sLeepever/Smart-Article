import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(plaintext: string): { encrypted: string; iv: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([encrypted, authTag]);
  return {
    encrypted: combined.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decrypt(encryptedBase64: string, ivBase64: string): string {
  const iv = Buffer.from(ivBase64, "base64");
  const combined = Buffer.from(encryptedBase64, "base64");
  const authTag = combined.subarray(combined.length - 16);
  const encrypted = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
