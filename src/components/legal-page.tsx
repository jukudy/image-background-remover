import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f8faf7] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:underline">
            Back to Clearcut
          </Link>
          <article className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>
            <div className="mt-10 space-y-8 text-[1.02rem] leading-8 text-slate-600 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
              {children}
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
