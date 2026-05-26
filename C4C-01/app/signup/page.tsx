"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const ROLES = [
  {
    value: "PATIENT",
    label: "Patient",
    blurb: "I want to track my own health. I generate a code to share with caregivers.",
  },
  {
    value: "CAREGIVER",
    label: "Caregiver",
    blurb: "I help a family member from afar. I redeem their 6-digit code to link.",
  },
  {
    value: "FOUNDATION_WORKER",
    label: "Foundation Worker",
    blurb: "I monitor rural screening camps, patients, and check for anomalies.",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"PATIENT" | "CAREGIVER" | "FOUNDATION_WORKER">(
    "CAREGIVER",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const body: Record<string, unknown> = { name, email, password, role };
      if (role === "PATIENT") {
        body.age = age ? Number(age) : undefined;
        body.gender = gender;
        body.location = location || undefined;
      }
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed");
        setBusy(false);
        return;
      }
      const signin = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setBusy(false);
      if (signin?.error) {
        setError("Account created, but auto sign-in failed. Try logging in.");
        return;
      }
      router.push(role === "PATIENT" ? "/account" : role === "FOUNDATION_WORKER" ? "/foundation" : "/account");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl glass bg-gradient-card rounded-3xl border border-border/30 p-8 shadow-float animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Create a PulsePoint account</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Select your role to get started. Patients generate secure link codes; caregivers redeem them.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value as typeof role)}
                className={`rounded-xl border p-4 text-left text-xs transition-all duration-200 ${
                  role === r.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/50 bg-background/30 hover:border-primary/30"
                }`}
              >
                <div className={`font-bold font-display text-sm ${role === r.value ? "text-primary" : "text-foreground"}`}>
                  {r.label}
                </div>
                <div className="mt-1.5 text-muted-foreground leading-relaxed">{r.blurb}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
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
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {role === "PATIENT" && (
            <div className="grid gap-4 rounded-2xl bg-secondary/30 p-4 ring-1 ring-border/20 md:grid-cols-3 animate-scale-in">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Sangli village, MH"
                  className="mt-1.5 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          )}

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
            {busy ? "Creating account…" : "Create account"}
          </button>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
