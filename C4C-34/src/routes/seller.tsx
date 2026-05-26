import { API_BASE } from "@/lib/api-base";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Filter,
  HandCoins,
  MessageCircle,
  Package,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/seller")({
  head: () => ({ meta: [{ title: "Seller Dashboard - HastKala" }] }),
  component: SellerPage,
});

const API = API_BASE;

interface Product {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  marketReady: boolean;
}

const demoProducts: Product[] = [
  {
    id: "p1",
    title: "Handmade Coconut Shell Lamp",
    price: 600,
    quantity: 4,
    category: "Home Decor",
    status: "approved",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    title: "Handwoven Cotton Saree",
    price: 2400,
    quantity: 2,
    category: "Textiles",
    status: "approved",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    title: "Banana Fiber Storage Basket",
    price: 850,
    quantity: 6,
    category: "Home Decor",
    status: "review",
    imageUrl:
      "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=300&q=80",
    createdAt: new Date().toISOString(),
  },
];

const activity = [
  { icon: MessageCircle, title: "WhatsApp lead received", body: "A buyer asked about the lamp shade size.", time: "8 min ago" },
  { icon: Truck, title: "Order ready to pack", body: "Cotton saree order needs pickup details.", time: "Today" },
  { icon: BookOpen, title: "Pricing module unlocked", body: "Complete it to improve your listing confidence.", time: "Yesterday" },
];

function SellerPage() {
  const { t } = useLang();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone");
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    marketReady: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", quantity: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    quantity: "1",
    category: "Home Decor",
  });

  const pendingCount = products.filter((p) => p.status !== "approved").length;
  const lowStockCount = products.filter((p) => p.quantity <= 2).length;
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setDevOtp("");
    setOtpNotice("");
    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const d = await res.json();
      if (d.success) {
        const delivered = d.data?.delivery?.delivered;
        setDevOtp(d.data?.devOtp || "");
        setOtpNotice(
          delivered
            ? t("seller.otpSent")
            : t("seller.otpFallback"),
        );
        setStep("otp");
      } else {
        setError(d.error?.message || t("seller.failedOtp"));
      }
    } catch {
      setError(t("seller.serverError"));
    }
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });
      const d = await res.json();
      if (d.success && d.data.verified) {
        await loadProducts();
        setStep("dashboard");
      } else {
        setError(d.error?.message || d.message || t("seller.invalidOtp"));
      }
    } catch {
      setError(t("seller.verifyError"));
    }
    setLoading(false);
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${API}/api/products?artisanPhone=${phone.trim()}&limit=50`);
      const d = await res.json();
      if (d.success && d.data.products?.length) {
        const apiProducts: Product[] = d.data.products.map((p: any) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          quantity: p.quantity ?? 1,
          category: p.category ?? "Handmade Crafts",
          status: p.status ?? "approved",
          imageUrl: p.imageUrl ?? p.image_url,
          createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
        }));
        setProducts(apiProducts);
        setStats({
          totalProducts: d.data.pagination?.total || apiProducts.length,
          totalOrders: Math.max(apiProducts.length + 2, 4),
          totalEarnings: apiProducts.reduce((sum, p) => sum + p.price, 0),
          marketReady: true,
        });
        return;
      }
    } catch {}
    useDemoData();
  }

  function useDemoData() {
    setProducts(demoProducts);
    setStats({ totalProducts: 3, totalOrders: 8, totalEarnings: 3850, marketReady: true });
    setStep("dashboard");
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      title: product.title,
      price: String(product.price),
      quantity: String(product.quantity),
    });
  }

  async function saveEdit(id: string) {
    // Optimistic UI: update local state first, roll back on API failure.
    const prevProduct = products.find((p) => p.id === id);
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              title: editForm.title,
              price: Number(editForm.price),
              quantity: Number(editForm.quantity),
            }
          : product,
      ),
    );
    setEditingId(null);
    // Skip API call for demo/local-only products.
    if (id.startsWith("local-") || id.startsWith("p")) return;
    try {
      const res = await fetch(`${API}/api/vendor/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
        }),
      });
      const d = await res.json();
      if (!d.success) {
        // Roll back on failure.
        if (prevProduct) {
          setProducts((prev) => prev.map((p) => (p.id === id ? prevProduct : p)));
        }
        setError(d.error?.message || "Could not save changes.");
      } else {
        setError("");
      }
    } catch {
      if (prevProduct) {
        setProducts((prev) => prev.map((p) => (p.id === id ? prevProduct : p)));
      }
      setError("Server unreachable. Changes not saved.");
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    const prev = products;
    setProducts((products) => products.filter((product) => product.id !== id));
    setStats((s) => ({ ...s, totalProducts: Math.max(0, s.totalProducts - 1) }));
    if (id.startsWith("local-") || id.startsWith("p")) return;
    try {
      const res = await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Roll back.
        setProducts(prev);
        setError("Could not delete on server. Local view rolled back.");
      } else {
        setError("");
      }
    } catch {
      setProducts(prev);
      setError("Server unreachable. Delete rolled back.");
    }
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProduct.title.trim() || !newProduct.price.trim()) return;
    if (!phone.trim()) {
      // Phone is the artisan key on the backend. Without it we can only
      // append a local row.
      setError("Sign in with your WhatsApp number first to publish products.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Backend expects { phone, message, ... }. We pack title/price/quantity
      // into the message so the AI listing service can preserve them, and
      // also pass them as hint fields for the controller's prefilled path.
      const message = `${newProduct.title.trim()}, ₹${newProduct.price}, ${newProduct.quantity || 1} available`;
      const res = await fetch(`${API}/api/products/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          message,
          craftType: newProduct.category,
          prefilled: {
            title: newProduct.title.trim(),
            price: Number(newProduct.price),
            quantity: Number(newProduct.quantity || 1),
            category: newProduct.category,
          },
        }),
      });
      const d = await res.json();
      if (!d.success) {
        setError(d.error?.message || "Could not create product.");
        return;
      }
      const created = d.data?.product || d.data;
      const product: Product = {
        id: created.id,
        title: created.title || newProduct.title.trim(),
        price: Number(created.price || newProduct.price),
        quantity: Number(created.quantity || newProduct.quantity || 1),
        category: created.category || newProduct.category,
        status: created.status || "pending_approval",
        imageUrl:
          created.imageUrl ||
          "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=300&q=80",
        createdAt: created.createdAt || new Date().toISOString(),
      };
      setProducts((prev) => [product, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalProducts: prev.totalProducts + 1,
        totalEarnings: prev.totalEarnings + product.price,
      }));
      setNewProduct({ title: "", price: "", quantity: "1", category: "Home Decor" });
    } catch {
      setError("Server unreachable. Product not created.");
    } finally {
      setLoading(false);
    }
  }

  if (step !== "dashboard") {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:py-16">
        <section className="flex min-h-[560px] flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> {t("seller.workspace")}
            </span>
            <h1 className="mt-6 max-w-xl font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              {t("seller.heroTitle")}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-primary-foreground/80 md:text-base">
              {t("seller.heroDesc")}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Camera, label: t("seller.photoListing") },
              { icon: Wallet, label: t("seller.incomeView") },
              { icon: MessageCircle, label: t("seller.whatsappLeads") },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-primary-foreground/10 p-4">
                <item.icon className="h-5 w-5" />
                <p className="mt-3 text-sm font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-7 shadow-craft md:p-8">
          <Store className="h-10 w-10 text-primary" />
          <h2 className="mt-5 font-display text-3xl font-semibold">{t("seller.openDesk")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("seller.openDeskDesc")}
          </p>

          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="mt-7 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold">{t("seller.whatsappNumber")}</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("seller.phonePlaceholder")}
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? t("seller.sendingOtp") : t("seller.sendOtp")}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={useDemoData}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-soft-highlight"
              >
                {t("seller.demoDashboard")}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-7 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("seller.enterOtp")} {phone}.
              </p>
              {otpNotice && (
                <p className="rounded-2xl bg-soft-highlight px-4 py-3 text-sm font-medium text-foreground">
                  {otpNotice}
                </p>
              )}
              {devOtp && (
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="flex w-full items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-left transition hover:bg-primary/10"
                >
                  <span className="text-sm font-semibold text-primary">{t("seller.testOtp")}</span>
                  <span className="font-mono text-xl font-bold tracking-[0.18em] text-foreground">
                    {devOtp}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{t("seller.fill")}</span>
                </button>
              )}
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-xl font-semibold tracking-[0.35em] outline-none focus:ring-2 focus:ring-primary/30"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? t("seller.verifying") : t("seller.verifyContinue")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setDevOtp("");
                  setOtpNotice("");
                  setError("");
                }}
                className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {t("seller.changeNumber")}
              </button>
            </form>
          )}

          <div className="mt-7 rounded-2xl bg-soft-highlight/60 p-4 text-sm text-muted-foreground">
            {t("seller.newHere")}{" "}
            <Link to="/community" className="font-semibold text-primary hover:underline">
              {t("seller.joinCommunity")}
            </Link>{" "}
            {t("seller.learnSell")}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-10">
      <section className="rounded-3xl bg-primary p-7 text-primary-foreground md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              {t("seller.dashboardLabel")}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              {t("seller.dashboardTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/80">
              {t("seller.dashboardDesc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${import.meta.env.VITE_BOT_PHONE || "919876543210"}?text=Hi%20%F0%9F%99%8F`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90"
            >
              <Plus className="h-4 w-4" /> {t("seller.addViaWhatsapp")}
            </a>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              {t("seller.switchSeller")}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Package, label: t("seller.liveListings"), value: stats.totalProducts, hint: t("seller.needReview", { count: pendingCount }) },
          { icon: BarChart3, label: t("seller.ordersMonth"), value: stats.totalOrders, hint: t("seller.demoCount") },
          {
            icon: HandCoins,
            label: t("seller.listedValue"),
            value: `Rs.${stats.totalEarnings.toLocaleString("en-IN")}`,
            hint: t("seller.acrossProducts"),
          },
          {
            icon: CheckCircle2,
            label: t("seller.shopReadiness"),
            value: stats.marketReady ? t("seller.ready") : t("seller.setup"),
            hint: t("seller.lowStock", { count: lowStockCount }),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="rounded-full bg-soft-highlight px-2.5 py-1 text-[11px] font-semibold text-primary">
                {item.hint}
              </span>
            </div>
            <p className="mt-5 font-display text-3xl font-semibold">{item.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold">{t("seller.listings")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("seller.listingsDesc")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("seller.searchListings")}
                  className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
                />
              </label>
              <label className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:w-40"
                >
                  <option value="all">{t("seller.allStatus")}</option>
                  <option value="approved">{t("seller.approved")}</option>
                  <option value="review">{t("seller.review")}</option>
                  <option value="draft">{t("seller.draft")}</option>
                </select>
              </label>
            </div>
          </div>

          <form onSubmit={addProduct} className="mt-5 grid gap-3 rounded-2xl bg-soft-highlight/50 p-4 lg:grid-cols-[1fr_120px_100px_150px_auto]">
            <input
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              placeholder={t("seller.newProductTitle")}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder={t("seller.price")}
              type="number"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              placeholder={t("seller.qty")}
              type="number"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Home Decor</option>
              <option>Textiles</option>
              <option>Jewellery</option>
              <option>Kitchen & Dining</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> {t("seller.add")}
            </button>
          </form>

          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 border-b border-border bg-card p-4 last:border-b-0 md:grid-cols-[72px_1fr_auto]"
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-18 w-18 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  {editingId === product.id ? (
                    <div className="grid gap-2 sm:grid-cols-[1fr_110px_90px_auto_auto]">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        type="number"
                        className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        type="number"
                        className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(product.id)}
                        className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground"
                      >
                        {t("common.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-semibold">{product.title}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            product.status === "approved"
                              ? "bg-accent/10 text-accent"
                              : product.status === "draft"
                                ? "bg-muted text-muted-foreground"
                                : "bg-secondary/10 text-secondary"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Rs.{product.price}</span>
                        <span>{t("seller.qty")} {product.quantity}</span>
                        <span>{product.category}</span>
                      </div>
                    </>
                  )}
                </div>
                {editingId !== product.id && (
                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                      aria-label={`Edit ${product.title}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-destructive hover:text-destructive"
                      aria-label={`Delete ${product.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                      aria-label={`View ${product.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-semibold">{t("seller.today")}</h2>
            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft-highlight text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <span className="text-[11px] text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-semibold">{t("seller.marketReadiness")}</h2>
            <div className="mt-5 space-y-3">
              {[
                t("seller.taskPhotos"),
                t("seller.taskStock"),
                t("seller.taskLesson"),
              ].map((task, index) => (
                <label key={task} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={index === 0}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#1f1f1f] p-6 text-white">
            <Clock3 className="h-7 w-7 text-secondary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">{t("seller.ideaTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {t("seller.ideaDesc")}
            </p>
            <Link
              to="/matchmaker"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary"
            >
              {t("seller.openMatchmaker")} <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
