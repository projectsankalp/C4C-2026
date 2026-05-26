import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Calendar, Package, Award } from "lucide-react";
import { getArtisan } from "@/data/mockArtisans";
import { getProductsByArtisan } from "@/data/mockProducts";
import { ProductCard } from "@/components/product/ProductCard";

export const Route = createFileRoute("/artisans/$id")({
  loader: ({ params }) => {
    const a = getArtisan(params.id);
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Artisan · HastKala Haat` },
          { name: "description", content: loaderData.story.slice(0, 155) },
        ]
      : [],
  }),
  component: ArtisanPage,
});

function ArtisanPage() {
  const artisan = Route.useLoaderData();
  const products = getProductsByArtisan(artisan.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
      <Link to="/products" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to marketplace
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[260px_1fr] md:gap-14">
        <div>
          <div className="grid h-48 w-48 place-items-center rounded-3xl bg-soft-highlight font-display text-7xl font-semibold text-primary md:h-60 md:w-60">
            {artisan.name[0]}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {artisan.craftType}
          </p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">{artisan.name}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {artisan.village ? `${artisan.village}, ` : ""}
            {artisan.district}
          </p>

          <p className="mt-6 max-w-2xl leading-relaxed text-foreground/85">{artisan.story}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Calendar, n: `${artisan.yearsOfExperience ?? "—"}`, l: "Years" },
              { icon: Package, n: `${artisan.totalProducts ?? products.length}`, l: "Products" },
              { icon: Package, n: `${artisan.totalOrders ?? 0}`, l: "Orders" },
              { icon: Award, n: "Certified", l: "Seller" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-4">
                <s.icon className="h-4 w-4 text-secondary" />
                <p className="mt-2 font-display text-2xl font-semibold">{s.n}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-8 font-display text-3xl md:text-4xl">Crafts by {artisan.name}</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products listed yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
