import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="glass bg-gradient-card rounded-2xl border border-border/30 text-card-foreground shadow-card hover:shadow-soft transition-all duration-300 animate-scale-in">
      {(title || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
