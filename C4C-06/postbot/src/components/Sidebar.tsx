"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/", icon: LayoutGrid, label: "Compose" },
  { href: "/dashboard", icon: CalendarDays, label: "Scheduled" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className="hidden xl:flex w-[72px] h-screen sticky top-0 flex-col items-center py-6 z-30 pr-sidebar"
      style={{ minWidth: 72 }}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center justify-center">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Post'r"
            width={36}
            height={36}
            style={{ filter: "invert(1)", objectFit: "contain" }}
          />
        </div>
      </Link>

      {/* Orange accent divider */}
      <div
        className="w-6 h-[2px] rounded-full mb-6"
        style={{ background: "linear-gradient(90deg, #FF6B35, #FFB347)" }}
      />

      {/* Nav Items */}
      <nav className="flex flex-col gap-3 flex-1 items-center">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={label}>
              <div className={`pr-nav-item${isActive ? " active" : ""}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Avatar */}
      <div className="mt-auto">
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover"
            style={{
              border: "2px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(255,107,53,0.3)",
            }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            }}
          >
            {session?.user?.name?.[0] ?? "U"}
          </div>
        )}
      </div>
    </aside>
  );
}
