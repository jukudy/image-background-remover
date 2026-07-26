import { createHash } from "node:crypto";

export function createOpaqueToken(size = 32) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(size))).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function pkceChallengeFromVerifier(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return Buffer.from(digest).toString("base64url");
}
