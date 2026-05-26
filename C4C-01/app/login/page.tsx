"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoadingAnimation } from "@/components/LoadingAnimation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setBusy(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(res?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md glass bg-gradient-card rounded-3xl border border-border/30 p-8 shadow-float animate-scale-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Sign in to PulsePoint</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Caregivers, patients, doctors, and administrators
          </p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-semibold">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-hero px-4 py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-95 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 mt-6"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          New to PulsePoint?{" "}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingAnimation text="Loading sign in..." />}>
      <LoginForm />
    </Suspense>
  );
}
