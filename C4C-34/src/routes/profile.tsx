import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { User, Mail, Phone, MapPin, LogOut, ArrowRight, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Your Profile — HastKala Haat" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center md:px-10">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-soft-highlight">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl">Your Profile</h1>
        <p className="mt-3 text-muted-foreground">Sign in to view your profile, orders, and saved addresses.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-soft-highlight"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone, address });
      setEditing(false);
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:px-10">
      <div className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 font-display text-4xl font-semibold text-primary">
          {initial}
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">{user.role}</p>
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="text-sm">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm">{user.phone}</span>
          </div>
        )}
        {user.address && (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm">{user.address}</span>
          </div>
        )}
      </div>

      {/* Edit Profile */}
      {editing ? (
        <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">Edit Profile</h2>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold hover:bg-soft-highlight"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-soft-highlight"
          >
            Edit Profile
          </button>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-soft-highlight"
          >
            <ShoppingBag className="h-4 w-4" /> My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/5 px-6 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
      </p>
    </div>
  );
}
