import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, type ReactNode } from "react";
import {
  Users, Award, Store, CheckCircle2, Clock, Package, ShoppingBag,
  ArrowUpRight, Activity, MessageCircle, AlertCircle, IndianRupee, Sparkles, Search,
} from "lucide-react";
import { API_BASE } from "@/lib/api-base";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — HastKala" }] }),
  component: AdminPage,
});

// Use API_BASE (empty string in prod) so requests go to /api/... same-origin
// and nginx routes them to the API. Falls back to window origin for the UI
// label only.
const API = API_BASE;
const apiHostLabel = (): string => {
  if (API) return API.replace(/^https?:\/\//, "");
  if (typeof window !== "undefined") return window.location.host;
  return "same origin";
};

// ============================================================================
// Types
// ============================================================================

interface Overview {
  members: { total: number; certified: number; pending: number };
  products: { pending: number; approved: number; rejected: number };
  artisans: { total: number; verified: number };
  orders: { thisWeek: number; new: number; totalRevenue: number };
  whatsapp: { messagesThisWeek: number };
}

interface Member {
  id: string; name: string; phone?: string; location?: string; skills?: string;
  stage: string; points: number; isCertified: boolean; createdAt: string; source?: string;
}

interface PendingProduct {
  id: string; title: string; description: string; price: number; imageUrl?: string;
  category: string; district: string; createdAt: string;
  artisan: { id: string; name?: string; phone: string; district: string };
}

interface Order {
  id: string; buyerName: string; buyerPhone: string; quantity: number; totalAmount: number;
  status: string; paymentStatus: string; createdAt: string;
  product: { title: string }; artisan: { name?: string; phone: string; district: string };
}

interface Artisan {
  id: string; name?: string; phone: string; district: string; craftType: string;
  isVerified: boolean; verificationStatus: string; createdAt: string;
  _count?: { products: number; orders: number };
}

interface ActivityEvent {
  type: string; timestamp: string; title: string; subtitle?: string; meta?: any;
}

type Tab = "overview" | "members" | "products" | "orders" | "artisans" | "activity";

// ============================================================================
// Page
// ============================================================================

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live data from the database — approve members, products & monitor the community.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Connected to {apiHostLabel()}
        </span>
      </header>

      {/* Tabs */}
      <nav className="mt-6 -mx-4 overflow-x-auto px-4">
        <div className="flex gap-1 border-b border-border">
          {([
            ["overview", Sparkles, "Overview"],
            ["members", Users, "Members"],
            ["products", Package, "Products"],
            ["orders", ShoppingBag, "Orders"],
            ["artisans", Store, "Artisans"],
            ["activity", Activity, "Activity"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab onTabChange={setTab} />}
        {tab === "members" && <MembersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "artisans" && <ArtisansTab />}
        {tab === "activity" && <ActivityTab />}
      </div>
    </div>
  );
}

// ============================================================================
// Overview tab
// ============================================================================

function OverviewTab({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/admin/overview`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); else setError("Could not load overview"); })
      .catch(() => setError("Could not reach API at " + (API || apiHostLabel()) + ". Check the server is up."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  const cards = [
    { label: "Pending Members", value: data.members.pending, icon: Clock, color: "orange", action: () => onTabChange("members") },
    { label: "Certified Members", value: data.members.certified, icon: Award, color: "secondary" },
    { label: "Pending Products", value: data.products.pending, icon: Package, color: "orange", action: () => onTabChange("products") },
    { label: "Approved Products", value: data.products.approved, icon: CheckCircle2, color: "green" },
    { label: "Verified Artisans", value: data.artisans.verified, icon: Store, color: "primary" },
    { label: "Orders This Week", value: data.orders.thisWeek, icon: ShoppingBag, color: "primary", action: () => onTabChange("orders") },
    { label: "New Orders", value: data.orders.new, icon: AlertCircle, color: "orange" },
    { label: "WA Messages (7d)", value: data.whatsapp.messagesThisWeek, icon: MessageCircle, color: "green" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.action}
            disabled={!c.action}
            className={`group rounded-2xl border border-border bg-card p-5 text-left transition ${c.action ? "hover:border-primary/40 hover:shadow-craft cursor-pointer" : "cursor-default"}`}
          >
            <div className="flex items-center justify-between">
              <c.icon className={`h-5 w-5 ${colorClass(c.color, "text")}`} />
              {c.action && <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />}
            </div>
            <p className={`mt-3 font-display text-3xl font-semibold ${colorClass(c.color, "text")}`}>{c.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground">Total Revenue</h3>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">
            <IndianRupee className="inline h-6 w-6" />
            {data.orders.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across {data.orders.thisWeek} orders this week</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground">Community Health</h3>
          <p className="mt-2 font-display text-3xl font-semibold text-secondary">
            {data.members.total === 0 ? "0" : Math.round((data.members.certified / data.members.total) * 100)}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.members.certified} certified out of {data.members.total} members
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Members tab
// ============================================================================

function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<"pending" | "certified" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/community/members?status=${filter}`);
      const j = await r.json();
      if (j.success) setMembers(j.data || []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      const r = await fetch(`${API}/api/community/certify/${id}`, { method: "POST" });
      if (r.ok) await load();
    } finally { setBusy(null); }
  };

  const reject = async (id: string) => {
    const reason = prompt("Why are you rejecting this member? (optional, sent to them)");
    if (reason === null) return; // user hit cancel
    setBusy(id);
    try {
      const r = await fetch(`${API}/api/community/reject/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (r.ok) await load();
    } finally { setBusy(null); }
  };

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [m.name, m.phone, m.location, m.skills].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {(["pending", "certified", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone…"
            className="rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? <Empty message={filter === "pending" ? "No pending members." : "No members found."} /> : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-sm">{m.name}</p>
                  {m.isCertified && <Badge color="green"><Award className="h-3 w-3" /> Certified</Badge>}
                  {m.source === "whatsapp_profile" && <Badge color="green"><MessageCircle className="h-3 w-3" /> WhatsApp</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {m.phone || "no phone"} · {m.location || "—"} · {m.skills || "—"} · {m.points} pts · {m.stage}
                </p>
              </div>
              {!m.isCertified && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => approve(m.id)}
                    disabled={busy === m.id || !m.phone}
                    title={!m.phone ? "No phone number — bot can't notify" : "Approve & notify on WhatsApp"}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
                  >
                    {busy === m.id ? "Approving…" : "Approve & Certify"}
                  </button>
                  <button
                    onClick={() => reject(m.id)}
                    disabled={busy === m.id || !m.phone}
                    title={!m.phone ? "No phone number — bot can't notify" : "Decline & notify on WhatsApp"}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-40"
                  >
                    {busy === m.id ? "…" : "Decline"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Products tab — pending approval queue
// ============================================================================

function ProductsTab() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/vendor/products/pending`);
      const j = await r.json();
      if (j.success) setProducts(j.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await fetch(`${API}/api/vendor/products/${id}/approve`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerName: "Admin" }),
      });
      await load();
    } finally { setBusy(null); }
  };

  const reject = async (id: string) => {
    const reason = prompt("Why is this product being rejected?");
    if (!reason) return;
    setBusy(id);
    try {
      await fetch(`${API}/api/vendor/products/${id}/reject`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, reviewerName: "Admin" }),
      });
      await load();
    } finally { setBusy(null); }
  };

  if (loading) return <Loader />;
  if (products.length === 0) return <Empty message="No products pending approval. The bot has nothing in the queue." />;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {products.map((p) => (
        <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          {p.imageUrl && (
            <img src={p.imageUrl} alt={p.title} className="h-48 w-full object-cover" />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <span className="shrink-0 font-display text-lg font-semibold text-primary">₹{p.price}</span>
            </div>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge color="muted">{p.category}</Badge>
              <Badge color="muted">{p.district}</Badge>
            </div>
            <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              By <span className="font-medium text-foreground">{p.artisan.name || "Unknown"}</span> · {p.artisan.phone}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => approve(p.id)}
                disabled={busy === p.id}
                className="flex-1 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {busy === p.id ? "…" : "Approve"}
              </button>
              <button
                onClick={() => reject(p.id)}
                disabled={busy === p.id}
                className="flex-1 rounded-full border border-border bg-background py-2 text-xs font-semibold hover:bg-muted disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Orders tab
// ============================================================================

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API}/api/vendor/orders${filter ? `?status=${filter}` : ""}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j.success) setOrders(j.data?.orders || []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API}/api/vendor/orders/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", "new", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : orders.length === 0 ? <Empty message="No orders found." /> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Artisan</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3">{o.product?.title}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.buyerName}</div>
                    <div className="text-xs text-muted-foreground">{o.buyerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.artisan?.name || o.artisan?.phone}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{o.totalAmount}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Artisans tab
// ============================================================================

function ArtisansTab() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/vendor/artisans`);
      const j = await r.json();
      if (j.success) setArtisans(j.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const verify = async (id: string) => {
    setBusy(id);
    try {
      await fetch(`${API}/api/vendor/artisans/${id}/verify`, { method: "PATCH" });
      await load();
    } finally { setBusy(null); }
  };

  if (loading) return <Loader />;
  if (artisans.length === 0) return <Empty message="No artisans yet." />;

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {artisans.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{a.name || "Unnamed"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.phone}</p>
            </div>
            {a.isVerified ? (
              <Badge color="green"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
            ) : (
              <Badge color="orange">Unverified</Badge>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><span className="font-medium text-foreground">{a._count?.products ?? 0}</span> products</div>
            <div><span className="font-medium text-foreground">{a._count?.orders ?? 0}</span> orders</div>
            <div className="col-span-2">{a.craftType} · {a.district}</div>
          </div>
          {!a.isVerified && (
            <button
              onClick={() => verify(a.id)}
              disabled={busy === a.id}
              className="mt-3 w-full rounded-full bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {busy === a.id ? "Verifying…" : "Verify Artisan"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Activity tab
// ============================================================================

function ActivityTab() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/admin/activity?limit=50`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setEvents(j.data || []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (events.length === 0) return <Empty message="No activity yet." />;

  return (
    <div className="space-y-2">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${eventColor(e.type)}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{e.title}</p>
            {e.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{e.subtitle}</p>}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(e.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function colorClass(color: string, kind: "text" | "bg") {
  const map: Record<string, { text: string; bg: string }> = {
    primary: { text: "text-primary", bg: "bg-primary/10" },
    secondary: { text: "text-secondary", bg: "bg-secondary/10" },
    accent: { text: "text-accent", bg: "bg-accent/10" },
    orange: { text: "text-orange-500", bg: "bg-orange-100" },
    green: { text: "text-green-600", bg: "bg-green-100" },
    muted: { text: "text-muted-foreground", bg: "bg-muted" },
  };
  return (map[color] ?? map.primary)[kind];
}

function Badge({ color = "muted", children }: { color?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass(color, "bg")} ${colorClass(color, "text")}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    new: "orange", confirmed: "primary", shipped: "primary", delivered: "green", cancelled: "muted",
  };
  return <Badge color={colorMap[status] ?? "muted"}>{status}</Badge>;
}

function Loader() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
}

function Empty({ message }: { message: string }) {
  return <p className="py-12 text-center text-sm text-muted-foreground">{message}</p>;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="mb-2 h-4 w-4" />
      {message}
    </div>
  );
}

function eventColor(type: string) {
  if (type.startsWith("member.certified")) return "bg-green-500";
  if (type.startsWith("member")) return "bg-blue-500";
  if (type.startsWith("product.approved")) return "bg-green-500";
  if (type.startsWith("product.rejected")) return "bg-red-500";
  if (type.startsWith("product")) return "bg-orange-500";
  if (type.startsWith("order.delivered")) return "bg-green-500";
  if (type.startsWith("order")) return "bg-purple-500";
  if (type.startsWith("approval")) return "bg-secondary";
  return "bg-muted-foreground";
}

function relativeTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
