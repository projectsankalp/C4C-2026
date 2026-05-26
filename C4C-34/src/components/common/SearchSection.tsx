import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, Camera, Mic, SlidersHorizontal, X } from "lucide-react";
import { mockProducts, CATEGORIES, DISTRICTS } from "@/data/mockProducts";

type Sort = "latest" | "price_asc" | "price_desc";

export function SearchSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<Sort>("latest");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    if (!query && !category && !district) return [];
    let list = mockProducts.filter((p) => {
      const q = query.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.artisan?.name.toLowerCase().includes(q) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(q));
      return (
        matchSearch &&
        (!category || p.category === category) &&
        (!district || p.district === district)
      );
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, category, district, sort]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/products", search: { q: query } });
    }
  }

  return (
    <div className="w-full px-4 py-4 md:px-10">
      <form onSubmit={handleSubmit} className="flex flex-nowrap items-center gap-2">
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition-all duration-200 hover:border-primary/30 hover:text-primary hover:shadow-craft md:h-10 md:w-10"
          title="Search by image"
        >
          <Camera className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-elegant transition-all duration-200 hover:border-primary/30 hover:text-primary hover:shadow-craft md:h-10 md:w-10"
          title="Voice search"
        >
          <Mic className="h-4 w-4" />
        </button>
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground md:left-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="h-9 w-full min-w-0 rounded-full border border-border/80 bg-card pl-9 pr-8 text-sm shadow-elegant transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:shadow-craft focus:outline-none md:h-10 md:pl-11 md:pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 text-muted-foreground/60 transition hover:text-foreground md:right-4"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-elegant transition-all duration-200 md:h-10 md:w-10 ${
            showFilters || category || district
              ? "border-primary/50 bg-primary/10 text-primary shadow-craft"
              : "border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:text-primary hover:shadow-craft"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </form>

      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          >
            <option value="">{t("products.allCategories")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          >
            <option value="">{t("products.allDistricts")}</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          >
            <option value="latest">{t("products.sortLatest")}</option>
            <option value="price_asc">{t("products.sortLowHigh")}</option>
            <option value="price_desc">{t("products.sortHighLow")}</option>
          </select>
          {(query || category || district) && results.length > 0 && (
            <p className="px-2 text-xs text-muted-foreground">
              {results.length}{" "}
              {results.length === 1 ? t("products.product") : t("products.products")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
