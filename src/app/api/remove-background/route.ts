import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ALLOWED_IMAGE_TYPES, detectImageType } from "@/lib/image-validation";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_MULTIPART_SIZE = MAX_FILE_SIZE + 1024 * 1024;
const ALLOWED_FIELDS = new Set(["image_file", "size", "format", "turnstile_token"]);
const requests = new Map<string, { count: number; resetAt: number }>();

type ErrorCode = "METHOD_NOT_ALLOWED" | "INVALID_CONTENT_TYPE" | "FILE_TOO_LARGE" | "UNSUPPORTED_IMAGE" | "VERIFICATION_FAILED" | "SUBJECT_NOT_FOUND" | "RATE_LIMITED" | "PROVIDER_UNAVAILABLE" | "PROVIDER_QUOTA_EXCEEDED" | "REQUEST_TIMEOUT" | "INTERNAL_ERROR";
const publicMessages: Record<ErrorCode, string> = {
  METHOD_NOT_ALLOWED: "This request method is not supported.", INVALID_CONTENT_TYPE: "Please upload an image using the form.", FILE_TOO_LARGE: "Your image is larger than 20MB. Please choose a smaller file.", UNSUPPORTED_IMAGE: "Please upload a JPG, PNG, or WebP image.", VERIFICATION_FAILED: "Verification failed. Please try again.", SUBJECT_NOT_FOUND: "We couldn't detect a clear subject in this image.", RATE_LIMITED: "Too many requests. Please wait a moment and try again.", PROVIDER_UNAVAILABLE: "Background removal is temporarily unavailable. Please try again later.", PROVIDER_QUOTA_EXCEEDED: "Background removal is temporarily unavailable. Please try again later.", REQUEST_TIMEOUT: "Processing took too long. Please try again.", INTERNAL_ERROR: "Something went wrong. Please try again.",
};

function errorResponse(code: ErrorCode, status: number, requestId: string, headers: HeadersInit = {}) {
  return NextResponse.json({ error: { code, message: publicMessages[code], requestId } }, { status, headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", ...headers } });
}

function methodNotAllowed() {
  return errorResponse("METHOD_NOT_ALLOWED", 405, randomUUID(), { Allow: "POST" });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

function getClientId(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function isRateLimited(id: string) {
  const now = Date.now();
  if (requests.size > 10_000) {
    for (const [key, value] of requests) {
      if (value.resetAt <= now) requests.delete(key);
    }
  }
  const entry = requests.get(id);
  if (!entry || entry.resetAt <= now) { requests.set(id, { count: 1, resetAt: now + 60_000 }); return false; }
  entry.count += 1;
  return entry.count > 5;
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(10_000) });
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const clientId = getClientId(request);
  if (isRateLimited(clientId)) return errorResponse("RATE_LIMITED", 429, requestId, { "Retry-After": "60" });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) return errorResponse("INVALID_CONTENT_TYPE", 415, requestId);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_SIZE) return errorResponse("FILE_TOO_LARGE", 413, requestId);

  try {
    const form = await request.formData();
    const fields = Array.from(form.keys());
    if (fields.some((field) => !ALLOWED_FIELDS.has(field))) return errorResponse("INVALID_CONTENT_TYPE", 400, requestId);
    if (form.getAll("image_file").length !== 1 || form.getAll("turnstile_token").length !== 1) return errorResponse("INVALID_CONTENT_TYPE", 400, requestId);
    const image = form.get("image_file");
    const token = form.get("turnstile_token");
    const size = form.get("size");
    const format = form.get("format");
    if (!(image instanceof File) || typeof token !== "string" || !token.trim()) return errorResponse("INVALID_CONTENT_TYPE", 400, requestId);
    if ((size !== null && size !== "auto") || (format !== null && format !== "png")) return errorResponse("INVALID_CONTENT_TYPE", 400, requestId);
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) return errorResponse("UNSUPPORTED_IMAGE", 415, requestId);
    if (image.size === 0) return errorResponse("UNSUPPORTED_IMAGE", 415, requestId);
    if (image.size > MAX_FILE_SIZE) return errorResponse("FILE_TOO_LARGE", 413, requestId);
    if ((await detectImageType(image)) !== image.type) return errorResponse("UNSUPPORTED_IMAGE", 415, requestId);
    if (!(await verifyTurnstile(token, clientId))) return errorResponse("VERIFICATION_FAILED", 403, requestId);

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) return errorResponse("PROVIDER_UNAVAILABLE", 503, requestId);
    const providerForm = new FormData();
    providerForm.append("image_file", image, "upload");
    providerForm.append("size", "auto");
    providerForm.append("format", "png");
    const provider = await fetch("https://api.remove.bg/v1.0/removebg", { method: "POST", headers: { "X-Api-Key": apiKey }, body: providerForm, signal: AbortSignal.timeout(60_000) });
    if (!provider.ok) {
      if (provider.status === 402 || provider.status === 403) return errorResponse("PROVIDER_QUOTA_EXCEEDED", 503, requestId);
      if (provider.status === 429) return errorResponse("RATE_LIMITED", 429, requestId, { "Retry-After": provider.headers.get("retry-after") || "60" });
      if (provider.status === 400 || provider.status === 422) return errorResponse("SUBJECT_NOT_FOUND", 422, requestId);
      return errorResponse("PROVIDER_UNAVAILABLE", 503, requestId);
    }
    if (!provider.body) return errorResponse("PROVIDER_UNAVAILABLE", 503, requestId);
    return new NextResponse(provider.body, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  } catch (caught) {
    if (caught instanceof Error && (caught.name === "TimeoutError" || caught.name === "AbortError")) return errorResponse("REQUEST_TIMEOUT", 504, requestId);
    if (caught instanceof TypeError) return errorResponse("PROVIDER_UNAVAILABLE", 503, requestId);
    return errorResponse("INTERNAL_ERROR", 500, requestId);
  }
}
