import Image from "next/image";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";

export async function AuthControls() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <Link
        href="/api/auth/google"
        prefetch={false}
        className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Sign in with Google
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 sm:flex">
        {session.user.picture ? (
          <Image
            src={session.user.picture}
            alt={session.user.name || session.user.email}
            width={28}
            height={28}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">
            {(session.user.name || session.user.email).slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="max-w-40">
          <p className="truncate text-sm font-semibold text-slate-900">{session.user.name || session.user.email}</p>
          <p className="truncate text-xs text-slate-500">{session.user.email}</p>
        </div>
      </div>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
