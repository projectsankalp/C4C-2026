import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Menu, Mic, Search, ShoppingCart, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useAuth();

  const links = [
    { to: "/products", label: t("nav.products") },
    { to: "/community", label: t("nav.community") },
    { to: "/network", label: t("nav.network") },
    { to: "/seller", label: t("nav.seller") },
    { to: "/impact", label: t("nav.impact") },
  ] as const;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate({ to: "/products", search: { q } });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background font-sans">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-foreground md:px-5 lg:gap-6">
        <div className="flex shrink-0 items-center gap-1 md:gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 rounded-sm border border-transparent p-1 font-bold text-foreground hover:border-gray-300 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-sm border border-transparent p-1 hover:border-gray-300"
          >
            <Logo className="h-9 w-9 text-black md:h-11 md:w-11" />
            <span className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
              HastKala<span className="text-primary">.in</span>
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="mx-auto hidden max-w-3xl flex-1 items-center gap-2 md:flex">
          <button
            type="button"
            title="Search by image"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition hover:border-primary/30 hover:text-primary"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Voice search"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition hover:border-primary/30 hover:text-primary"
          >
            <Mic className="h-4 w-4" />
          </button>
          <label className="relative block min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("products.searchPlaceholder")}
              className="h-10 w-full rounded-full border border-border/80 bg-card pl-9 pr-4 text-sm shadow-elegant outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:shadow-craft"
            />
          </label>
        </form>

        <div className="flex shrink-0 items-center gap-1 md:gap-3">
          <div className="hidden rounded-sm border border-transparent p-1 hover:border-gray-300 md:flex">
            <LanguageSwitcher />
          </div>

          <Link
            to="/profile"
            className="hidden cursor-pointer flex-col rounded-sm border border-transparent p-1 pt-2 leading-none hover:border-gray-300 md:flex"
          >
            <span className="text-[12px] text-muted-foreground">{t("nav.hello")}</span>
            <span className="flex items-center pt-0.5 text-sm font-bold">
              {user ? user.name.split(" ")[0] : t("nav.accountLists")} <span className="ml-1 text-[10px]">v</span>
            </span>
          </Link>

          <Link
            to="/checkout"
            className="flex cursor-pointer items-end rounded-sm border border-transparent p-1 hover:border-gray-300"
          >
            <div className="relative flex items-end">
              <ShoppingCart className="h-8 w-8" />
              <span className="absolute -top-1 left-3.5 rounded-full bg-background px-1 text-[13px] font-bold text-[#f3a847]">
                0
              </span>
            </div>
            <span className="hidden pb-0.5 text-sm font-bold md:inline-block">{t("nav.cart")}</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-border/50 bg-primary/5 px-4 py-2 md:px-5">
        <div className="flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <form onSubmit={handleSearch} className="grid min-w-0 flex-1 grid-cols-[2.25rem_2.25rem_minmax(0,1fr)] items-center gap-2 md:hidden">
            <button
              type="button"
              title="Search by image"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition hover:border-primary/30 hover:text-primary"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Voice search"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition hover:border-primary/30 hover:text-primary"
            >
              <Mic className="h-4 w-4" />
            </button>
            <label className="relative block min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("products.searchPlaceholder")}
                className="h-9 w-full min-w-0 rounded-full border border-border/80 bg-card pl-9 pr-3 text-sm shadow-elegant outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:shadow-craft"
              />
            </label>
          </form>

          <nav className="hidden items-center gap-5 text-sm md:flex lg:gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="shrink-0 rounded-sm px-1 py-1 font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary lg:px-2"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="shrink-0 rounded-sm px-1 py-1 font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary lg:px-2"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 z-50 h-screen w-4/5 max-w-[320px] overflow-y-auto border-r border-border bg-background text-foreground shadow-2xl md:hidden">
            <div className="border-b border-border bg-primary p-5 text-primary-foreground">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Logo className="h-9 w-9 text-primary-foreground" />
                  <span className="font-display text-xl font-semibold">
                    HastKala<span className="text-secondary">.in</span>
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 transition hover:bg-primary-foreground/20"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm font-semibold text-primary-foreground/90">
                {user ? user.name : t("nav.hello")}
              </p>
            </div>
            <div className="flex flex-col gap-5 p-5">
              <div>
                <div className="mb-3 border-b border-border pb-2 font-display text-lg font-semibold text-foreground">
                  {t("nav.shopByCategory")}
                </div>
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-base font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 border-b border-border pb-2 font-display text-lg font-semibold text-foreground">
                  {t("nav.helpSettings")}
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-base font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {t("nav.accountLists")}
                </Link>
                <div className="mt-4 rounded-full border border-border bg-card p-1 shadow-elegant">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
