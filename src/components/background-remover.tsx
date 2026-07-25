"use client";

import Script from "next/script";
import Image from "next/image";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, detectImageType } from "@/lib/image-validation";

type ToolState = "idle" | "ready" | "verifying" | "processing" | "success" | "error";
type TurnstileApi = { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

const MAX_SIZE = 20 * 1024 * 1024;
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const messages: Record<string, string> = {
  FILE_TOO_LARGE: "Your image is larger than 20MB. Please choose a smaller file.",
  UNSUPPORTED_IMAGE: "Please upload a JPG, PNG, or WebP image.",
  CORRUPT_IMAGE: "We couldn't read this image. Please try another file.",
  VERIFICATION_FAILED: "Verification failed. Please try again.",
  SUBJECT_NOT_FOUND: "We couldn't detect a clear subject in this image.",
  PROVIDER_QUOTA_EXCEEDED: "Background removal is temporarily unavailable. Please try again later.",
  PROVIDER_UNAVAILABLE: "Background removal is temporarily unavailable. Please try again later.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  REQUEST_TIMEOUT: "Processing took too long. Please try again.",
  NETWORK_ERROR: "Your connection was interrupted. Please try again.",
};

function track(name: string, detail: Record<string, string> = {}) {
  window.dispatchEvent(new CustomEvent("clearcut:analytics", { detail: { name, ...detail } }));
}

function sizeBucket(bytes: number) {
  if (bytes < 1024 * 1024) return "<1MB";
  if (bytes < 5 * 1024 * 1024) return "1-5MB";
  if (bytes < 10 * 1024 * 1024) return "5-10MB";
  return "10-20MB";
}

function UploadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-2"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

async function canDecodeImage(file: File) {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return;
  }

  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image decoding failed"));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function BackgroundRemover() {
  const [state, setState] = useState<ToolState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [slider, setSlider] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const selectionIdRef = useRef(0);

  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl); }, [originalUrl]);
  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  const removeTurnstile = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current);
    }
    widgetIdRef.current = null;
  }, []);

  const renderTurnstile = useCallback(() => {
    if (!siteKey || !window.turnstile || !widgetContainerRef.current || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      callback: (token: string) => { setTurnstileToken(token); setError(null); setState((current) => current === "verifying" ? "ready" : current); },
      "expired-callback": () => { setTurnstileToken(""); setState((current) => current === "processing" || current === "success" ? current : "verifying"); },
      "error-callback": () => { setTurnstileToken(""); setError(messages.VERIFICATION_FAILED); setState("error"); },
    });
  }, []);

  useEffect(() => {
    if (state !== "idle" && state !== "success") renderTurnstile();
  }, [renderTurnstile, state]);

  useEffect(() => removeTurnstile, [removeTurnstile]);

  async function chooseFile(nextFile: File) {
    const selectionId = ++selectionIdRef.current;
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.has(nextFile.type)) {
      setState("error"); setError(messages.UNSUPPORTED_IMAGE); track("upload_rejected", { reason: "unsupported_type" }); return;
    }
    if (nextFile.size > MAX_SIZE) {
      setState("error"); setError(messages.FILE_TOO_LARGE); track("upload_rejected", { reason: "file_too_large" }); return;
    }
    if (nextFile.size === 0) {
      setState("error"); setError(messages.CORRUPT_IMAGE); track("upload_rejected", { reason: "unreadable_image" }); return;
    }

    try {
      const detectedType = await detectImageType(nextFile);
      if (detectedType !== nextFile.type) throw new Error("Image signature mismatch");
      await canDecodeImage(nextFile);
    } catch {
      if (selectionId !== selectionIdRef.current) return;
      setState("error"); setError(messages.CORRUPT_IMAGE); track("upload_rejected", { reason: "unreadable_image" }); return;
    }

    if (selectionId !== selectionIdRef.current) return;
    removeTurnstile();
    setTurnstileToken("");
    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    setResultUrl(null);
    setSlider(50);
    setState(siteKey ? "verifying" : "ready");
    track("upload_selected", { mime_type: nextFile.type, size_bucket: sizeBucket(nextFile.size) });
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) void chooseFile(selected);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) void chooseFile(dropped);
  }

  async function removeBackground() {
    if (!file || state === "processing") return;
    if (siteKey && !turnstileToken) {
      setState("verifying"); setError(messages.VERIFICATION_FAILED); return;
    }
    setState("processing"); setError(null);
    track("remove_started", { mime_type: file.type, size_bucket: sizeBucket(file.size) });
    const started = performance.now();
    const form = new FormData();
    form.append("image_file", file);
    form.append("size", "auto");
    form.append("format", "png");
    form.append("turnstile_token", turnstileToken || "development-bypass");
    try {
      const response = await fetch("/api/remove-background", { method: "POST", body: form });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
        const code = payload?.error?.code ?? "INTERNAL_ERROR";
        throw Object.assign(new Error(payload?.error?.message || messages[code] || "We couldn't process this image. Please try again."), { code });
      }
      const blob = await response.blob();
      if (!blob.type.includes("image/png")) throw new Error("The processing service returned an invalid image.");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setState("success");
      removeTurnstile();
      track("remove_succeeded", { duration_bucket: `${Math.ceil((performance.now() - started) / 5000) * 5}s` });
    } catch (caught) {
      const failure = caught as Error & { code?: string };
      const code = failure.code ?? (failure.name === "TypeError" ? "NETWORK_ERROR" : "INTERNAL_ERROR");
      setError(messages[code] || failure.message || "We couldn't process this image. Please try again.");
      setState("error");
      track("remove_failed", { error_code: code });
      if (siteKey && window.turnstile) { window.turnstile.reset(widgetIdRef.current ?? undefined); setTurnstileToken(""); }
    }
  }

  function download() {
    if (!resultUrl || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "image";
    const anchor = document.createElement("a");
    anchor.href = resultUrl; anchor.download = `${base}-no-background.png`; anchor.click();
    track("download_clicked", { result_format: "png" });
  }

  function reset() {
    selectionIdRef.current += 1;
    removeTurnstile();
    setFile(null); setOriginalUrl(null); setResultUrl(null); setError(null); setState("idle"); setSlider(50); setTurnstileToken("");
    if (inputRef.current) inputRef.current.value = "";
    track("remove_another_clicked", { previous_state: state });
  }

  const isProcessing = state === "processing";
  const isPending = state === "processing" || state === "verifying";

  return (
    <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/90 bg-white p-3 shadow-[0_30px_80px_-35px_rgba(18,57,47,.3)] sm:p-5">
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderTurnstile} />}

      {state === "idle" || (state === "error" && !file) ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="relative grid min-h-96 place-items-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-emerald-200 bg-[#f5f9f2] px-6 py-12 text-center transition hover:border-[#72a85c] hover:bg-[#f0f7ea]">
          <div className="relative z-10">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#143c32] text-[#c8f58b] shadow-lg shadow-emerald-950/10"><UploadIcon /></div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Drop your image here</h2>
            <p className="mt-2 text-slate-600">or choose a file from your device</p>
            <button onClick={() => inputRef.current?.click()} className="mt-6 rounded-full bg-[#b8f36b] px-7 py-3.5 font-semibold text-[#15342b] shadow-sm transition hover:bg-[#a8e75b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#143c32]">Upload Image</button>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">JPG, PNG or WebP · Max 20MB</p>
            <p className="mx-auto mt-5 max-w-lg text-xs leading-5 text-slate-500">Your image is sent securely to our processing provider and is not stored by this website.</p>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#f4f6f3] lg:grid-cols-[1.4fr_.6fr]">
          <div className="relative min-h-96 overflow-hidden checkerboard sm:min-h-[32rem]">
            {originalUrl && !resultUrl && <Image src={originalUrl} alt="Original upload preview" fill unoptimized sizes="(max-width: 1024px) 100vw, 70vw" className="object-contain" />}
            {resultUrl && <Image src={resultUrl} alt="Background removed result" fill unoptimized sizes="(max-width: 1024px) 100vw, 70vw" className="object-contain" />}
            {resultUrl && originalUrl && <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${slider}%)` }}><Image src={originalUrl} alt="Original image for comparison" fill unoptimized sizes="(max-width: 1024px) 100vw, 70vw" className="object-contain" /></div>}
            {resultUrl && <><div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${slider}%` }} /><span className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white">After</span><span className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">Before</span><label className="absolute inset-x-5 bottom-5 rounded-full bg-slate-950/80 px-4 py-2 text-xs font-medium text-white backdrop-blur"><span className="sr-only">Before and after comparison</span><input type="range" min="0" max="100" value={slider} onChange={(event) => setSlider(Number(event.target.value))} className="w-full accent-[#b8f36b]" aria-label="Show more or less of the background removed result" /></label></>}
            {isPending && <div className="absolute inset-0 grid place-items-center bg-[#102f28]/85 text-center text-white backdrop-blur-sm"><div><div className="relative mx-auto mb-5 h-20 w-48 overflow-hidden rounded-2xl border border-white/15 bg-white/5"><div className="scan-line absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#b8f36b]/70 to-transparent" /></div><p className="text-lg font-semibold">{state === "verifying" ? "Verifying…" : "Removing background…"}</p><p className="mt-2 text-sm text-emerald-50/70">{state === "verifying" ? "Complete the check to continue." : "This usually takes only a few seconds."}</p></div></div>}
          </div>
          <aside className="flex flex-col justify-between bg-white p-6">
            <div>
              <div className="flex items-center gap-3" role="status" aria-live="polite"><span className={`size-2.5 rounded-full ${state === "success" ? "bg-emerald-500" : state === "error" ? "bg-red-500" : "bg-amber-400"}`} /><span className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">{state}</span></div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{state === "success" ? "Your image is ready." : state === "error" ? "Something went wrong." : "Your image is ready to process."}</h3>
              {file && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="truncate text-sm font-medium text-slate-800">{file.name}</p><p className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type.replace("image/", "").toUpperCase()}</p></div>}
              {error && <p role="alert" aria-live="assertive" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</p>}
              {siteKey && state !== "success" && <div ref={widgetContainerRef} className="mt-5 min-h-16" />}
            </div>
            <div className="mt-8 space-y-3">
              {state === "success" ? <button onClick={download} className="w-full rounded-full bg-[#b8f36b] px-5 py-3.5 font-semibold text-[#15342b] transition hover:bg-[#a8e75b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">Download PNG</button> : <button onClick={removeBackground} disabled={isPending || Boolean(siteKey && !turnstileToken)} className="w-full rounded-full bg-[#143c32] px-5 py-3.5 font-semibold text-white transition hover:bg-[#0c2c24] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">{isProcessing ? "Removing background…" : state === "verifying" ? "Complete verification" : "Remove Background"}</button>}
              <button onClick={reset} disabled={isProcessing} className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Remove another image</button>
            </div>
          </aside>
        </div>
      )}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onInput} className="sr-only" aria-label="Choose an image to remove its background" />
    </div>
  );
}
