import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#eaf1e9] px-5"><div className="max-w-lg text-center"><p className="font-mono text-sm font-semibold text-emerald-800">404</p><h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950">This edge got cut.</h1><p className="mt-5 text-lg leading-8 text-slate-600">The page you were looking for does not exist. Head back to the tool and remove a background instead.</p><Link href="/#tool" className="mt-8 inline-flex rounded-full bg-[#143c32] px-6 py-3.5 font-semibold text-white">Back to the tool</Link></div></main>;
}
