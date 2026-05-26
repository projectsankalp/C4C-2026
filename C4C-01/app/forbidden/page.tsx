"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function ForbiddenPage() {
  const { data: session } = useSession();
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-3 text-2xl font-bold text-red-900">Access denied</h1>
      <p className="mt-2 text-sm text-red-800">
        Your role{" "}
        <span className="font-mono font-semibold">
          {session?.user?.role ?? "(unknown)"}
        </span>{" "}
        doesn&apos;t have permission to view this page.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link
          href="/"
          className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Go home
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
