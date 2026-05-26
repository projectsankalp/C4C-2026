import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getMockProductImage, mockProducts, CATEGORIES, DISTRICTS } from "@/data/mockProducts";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";
import { API_BASE } from "@/lib/api-base";
import { useLang } from "@/lib/i18n";

const API_URL = API_BASE;

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Marketplace - HastKala Haat" },
      {
        name: "description",
        content:
          "Browse handmade products by women artisans across Karnataka's craft districts.",
      },
    ],
  }),
  component: ProductsPage,
});

type Sort = "latest" | "price_asc" | "price_desc";

function ProductsPage() {
  const params = useParams({ strict: false });

  if ("id" in params && params.id) {
    return <Outlet />;
  }

  return <ProductsIndex />;
}

function ProductsIndex() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<"all" | "under500" | "500to1000" | "over1000">(
    "all",
  );
  const [sort, setSort] = useState<Sort>("latest");
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products?limit=100`)
      .then((r) => r.json())
      .then((res) => {
        const items = res?.data?.products ?? res?.data ?? [];
        if (Array.isArray(items) && items.length > 0) {
          const mapped: Product[] = items.map((p: any) => ({
            id: p.id,
            artisanId: p.artisanId ?? p.artisan_id ?? "",
            title: p.title,
            description: p.description ?? "",
            price: p.price,
            quantity: p.quantity ?? 1,
            category: p.category ?? "Handmade Crafts",
            district: p.district ?? "",
            imageUrl: getMockProductImage(p.id) ?? p.imageUrl ?? p.image_url ?? "",
            status: p.status ?? "approved",
            aiGenerated: p.aiGenerated ?? p.ai_generated,
            material: p.material,
            tags: p.tags,
            createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
            newFromWhatsApp: true,
            artisan: p.artisan
              ? {
                  id: p.artisan.id,
                  name: p.artisan.name ?? "",
                  district: p.artisan.district ?? "",
                  isVerified: p.artisan.isVerified ?? p.artisan.is_verified ?? false,
                }
              : undefined,
          }));
          setApiProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const allProducts = useMemo(() => {
    if (apiProducts.length === 0) return mockProducts;
    const apiIds = new Set(apiProducts.map((p) => p.id));
    const uniqueMock = mockProducts.filter((p) => !apiIds.has(p.id));
    return [...apiProducts, ...uniqueMock];
  }, [apiProducts]);

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const toggleDistrict = (d: string) => {
    setSelectedDistricts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedDistricts([]);
    setPriceRange("all");
    setSort("latest");
  };

  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.artisan?.name.toLowerCase().includes(q);

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchDistrict =
        selectedDistricts.length === 0 || (p.district && selectedDistricts.includes(p.district));

      let matchPrice = true;
      if (priceRange === "under500") matchPrice = p.price < 500;
      if (priceRange === "500to1000") matchPrice = p.price >= 500 && p.price <= 1000;
      if (priceRange === "over1000") matchPrice = p.price > 1000;

      return matchSearch && matchCategory && matchDistrict && matchPrice;
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "latest") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return list;
  }, [search, selectedCategories, selectedDistricts, priceRange, sort, allProducts]);

  return (
    <div className="mx-auto w-full px-4 py-6 md:px-10 md:py-12">
      <div className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {t("products.pageTitle")}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight md:text-5xl">
          {t("products.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("products.desc")}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters((value) => !value)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-elegant"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? t("products.hideFilters") : t("products.filters")}
        </button>
        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          {t("products.results")}
        </p>
      </div>

      <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
        <aside
          className={`w-full shrink-0 space-y-6 rounded-2xl border border-border bg-card p-4 shadow-elegant md:block md:w-64 md:space-y-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            showMobileFilters ? "block" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{t("products.filters")}</h2>
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("products.clearAll")}
            </button>
          </div>

          <div className="space-y-3">
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("products.searchShort")}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("products.category")}
            </h3>
            {CATEGORIES.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c)}
                  onChange={() => toggleCategory(c)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{c}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("products.price")}
            </h3>
            {[
              { id: "all", label: t("products.allPrices") },
              { id: "under500", label: t("products.under500") },
              { id: "500to1000", label: t("products.price500to1000") },
              { id: "over1000", label: t("products.over1000") },
            ].map((pr) => (
              <label key={pr.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === pr.id}
                  onChange={() => setPriceRange(pr.id as typeof priceRange)}
                  className="border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{pr.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("products.district")}
            </h3>
            {DISTRICTS.map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDistricts.includes(d)}
                  onChange={() => toggleDistrict(d)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{d}</span>
              </label>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
            <p className="hidden text-sm text-muted-foreground md:block">
              {t("products.showing")}{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {t("products.results")}
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <label htmlFor="sort" className="shrink-0 text-sm text-muted-foreground">
                {t("products.sortBy")}:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none sm:flex-none"
              >
                <option value="latest">{t("products.sortLatest")}</option>
                <option value="price_asc">{t("products.sortLowHigh")}</option>
                <option value="price_desc">{t("products.sortHighLow")}</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-4 font-display text-2xl">{t("products.emptyTitle")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("products.emptyDesc")}
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <X className="h-4 w-4" /> {t("products.clearAllFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
