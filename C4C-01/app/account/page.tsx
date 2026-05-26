"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card } from "@/components/Card";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface CodeResp {
  code: string;
  expiresAt: string;
}

interface RedeemResp {
  linked: { patientId: string; patientName: string; permission: string };
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [code, setCode] = useState<CodeResp | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemInput, setRedeemInput] = useState("");
  const [permission, setPermission] = useState<"VIEW_ONLY" | "TRIAGE" | "FULL">(
    "TRIAGE",
  );
  const [redeemed, setRedeemed] = useState<RedeemResp["linked"] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (status === "loading") {
    return <LoadingAnimation fullScreen={false} text="Loading account..." />;
  }
  if (!session?.user) {
    return null;
  }

  const role = session.user.role;

  async function generateCode() {
    setError(null);
    setBusy(true);
    try {
      const r = await fetch("/api/links/code", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      setCode(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function redeemCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRedeemed(null);
    setBusy(true);
    try {
      const r = await fetch("/api/links/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemInput, permission }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      setRedeemed(data.linked);
      setRedeemInput("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const remaining = code
    ? Math.max(0, Math.floor((Date.parse(code.expiresAt) - now) / 1000))
    : 0;

  return (
    <div className="space-y-6">
      <Card title="Your account">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-slate-500">Name</div>
            <div className="font-semibold text-navy-900">{session.user.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Email</div>
            <div className="font-mono text-navy-900">{session.user.email}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Role</div>
            <div>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                {role}
              </span>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </Card>

      {role === "PATIENT" && (
        <Card title="Generate a caregiver link code">
          <p className="text-sm text-slate-600">
            Share this 6-digit code with a family member to grant them remote
            triage access. Codes expire in 15 minutes and can only be used once.
          </p>
          <button
            type="button"
            onClick={generateCode}
            disabled={busy}
            className="mt-3 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "Generating…" : "Generate new code"}
          </button>
          {code && (
            <div className="mt-4 rounded-lg bg-navy-900 p-5 text-center text-white">
              <div className="text-xs uppercase tracking-widest text-teal-300">
                Your link code
              </div>
              <div className="mt-1 font-mono text-5xl font-bold tracking-[0.4em] text-white">
                {code.code}
              </div>
              <div className="mt-2 text-xs text-slate-300">
                Expires in {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </div>
            </div>
          )}
        </Card>
      )}

      {role === "CAREGIVER" && (
        <Card title="Link to a patient (redeem code)">
          <p className="text-sm text-slate-600">
            Ask the patient to generate a 6-digit code from their account, then
            paste it here. They control the permission level.
          </p>
          <form
            onSubmit={redeemCode}
            className="mt-3 flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="text-xs font-medium text-slate-600">
                6-digit code
              </label>
              <input
                value={redeemInput}
                onChange={(e) => setRedeemInput(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                placeholder="123456"
                className="mt-1 w-32 rounded-md border border-slate-300 px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">
                Permission
              </label>
              <select
                value={permission}
                onChange={(e) =>
                  setPermission(e.target.value as typeof permission)
                }
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="VIEW_ONLY">View only</option>
                <option value="TRIAGE">Triage on behalf</option>
                <option value="FULL">Full access</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {busy ? "Linking…" : "Link account"}
            </button>
          </form>
          {redeemed && (
            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              Linked to <strong>{redeemed.patientName}</strong> with permission{" "}
              <span className="font-mono">{redeemed.permission}</span>. Open the
              caregiver dashboard to start a triage.
            </div>
          )}
        </Card>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
