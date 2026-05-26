import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="mt-24 border-t border-border bg-soft-highlight/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-black" />
            <span className="font-display text-2xl font-semibold">HastKala Haat</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-semibold">{t("footer.forBuyers")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-primary">
                {t("footer.verifiedCrafts")}
              </Link>
            </li>
            <li>
              <Link to="/impact" className="hover:text-primary">
                {t("footer.ourImpact")}
              </Link>
            </li>
            <li>
              <a href="/#how" className="hover:text-primary">
                {t("nav.howItWorks")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-base font-semibold">{t("footer.forArtisans")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("footer.sellViaWhatsApp")}</li>
            <li>{t("footer.karigarSakhiSupport")}</li>
            <li>{t("footer.localLanguageOnboarding")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-6 py-5 text-center text-xs text-muted-foreground md:px-10">
        {t("footer.builtFor")}
      </div>
    </footer>
  );
}
