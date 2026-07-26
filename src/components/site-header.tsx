import Link from "next/link";
import { AuthControls } from "@/components/auth-controls";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f8faf7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950">
          <span className="grid size-9 place-items-center rounded-xl bg-[#143c32] text-white shadow-sm">
            <span className="size-3.5 rounded-sm border-2 border-[#b8f36b]" />
          </span>
          <span className="text-lg">clearcut</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
            <Link href="/#how-it-works" className="transition hover:text-slate-950">How it works</Link>
            <Link href="/#faq" className="transition hover:text-slate-950">FAQ</Link>
            <Link href="/privacy" className="transition hover:text-slate-950">Privacy</Link>
          </nav>
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
