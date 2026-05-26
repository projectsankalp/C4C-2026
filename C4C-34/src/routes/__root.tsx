import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BottomBar } from "@/components/layout/BottomBar";
import { LangProvider } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-primary">404</h1>
        <h2 className="mt-4 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Back to HastKala Haat
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const previewImage =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/22b7e2aa-8cf0-430d-a7e5-c9a8b5b8bf83/id-preview-f45cda09--bf44d1eb-68ef-45a3-9dd7-945b6d2cd27d.lovable.app-1779697198167.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HastKala Haat - Handmade by Women Artisans" },
      {
        name: "description",
        content:
          "A WhatsApp-first marketplace for handmade crafts by rural women artisans across 15+ craft districts.",
      },
      { property: "og:title", content: "HastKala Haat - Handmade by Women Artisans" },
      {
        property: "og:description",
        content:
          "Handmade by women artisans. Delivered directly to you. Every listing reviewed before going live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "HastKala Haat - Handmade by Women Artisans" },
      {
        name: "twitter:description",
        content:
          "HastKala Haat is a premium public marketplace connecting buyers directly with women artisans.",
      },
      { property: "og:image", content: previewImage },
      { name: "twitter:image", content: previewImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#df2227" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=3" },
      { rel: "alternate icon", type: "image/svg+xml", href: "/favicon.svg?v=3" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.svg?v=3" },
      { rel: "mask-icon", href: "/favicon.svg?v=3", color: "#df2227" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <LangProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-20">
              <Outlet />
            </main>
            <Footer />
            <BottomBar />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </LangProvider>
  );
}
