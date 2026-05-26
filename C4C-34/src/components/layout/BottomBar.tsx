import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Home, Store, User, ShoppingBag } from "lucide-react";

const tabs = [
  { icon: Home, labelKey: "bottom.home", to: "/" as const },
  { icon: Store, labelKey: "nav.products", to: "/products" as const },
  { icon: User, labelKey: "bottom.you", to: "/profile" as const },
  { icon: ShoppingBag, labelKey: "bottom.cart", to: "/checkout" as const },
];

export function BottomBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = router.state.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const active = pathname === tab.to || (tab.to !== "/" && pathname.startsWith(tab.to));
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? "fill-primary/10" : ""}`} />
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
