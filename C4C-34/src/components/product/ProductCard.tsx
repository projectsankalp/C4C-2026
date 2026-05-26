import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import type { Product } from "@/lib/types";
import { MapPin, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLang();
  const shareText = `${product.title} by ${product.artisan?.name} - Rs. ${product.price} on HastKala Haat!`;

  function shareOnWhatsApp(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-craft md:rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={`${product.title} handmade by ${product.artisan?.name ?? "HastKala artisan"}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-2 md:left-3 md:top-3">
          {product.newFromWhatsApp && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold text-primary-foreground md:px-2.5 md:text-xs">
              <Sparkles className="h-3 w-3" /> {t("productCard.new")}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3.5 md:gap-3 md:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {product.category}
        </p>
        <h3 className="font-display text-lg leading-snug text-foreground line-clamp-2 md:text-xl">
          {product.title}
        </h3>
        <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground md:text-sm">
          <span>{t("productCard.by")}</span>
          <span className="max-w-full truncate font-medium text-foreground">{product.artisan?.name}</span>
          <span aria-hidden>-</span>
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{product.district}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="min-w-0 truncate font-display text-xl font-semibold text-primary md:text-2xl">
            Rs. {product.price.toLocaleString("en-IN")}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={shareOnWhatsApp}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#25D366]/30 text-[#25D366] transition hover:bg-[#25D366]/10 md:h-9 md:w-9"
              aria-label="Share on WhatsApp"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
            </button>
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition group-hover:bg-primary/90 md:px-4 md:py-2 md:text-sm">
              {t("productCard.view")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
