"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderGit2, Rocket, Globe, Settings } from "lucide-react";

const nav = [
  { href: "/dashboard",    label: "Overview",     icon: LayoutDashboard },
  { href: "/projects",     label: "Projects",     icon: FolderGit2 },
  { href: "/deployments",  label: "Deployments",  icon: Rocket },
  { href: "/domains",      label: "Domains",      icon: Globe },
  { href: "/settings",     label: "Settings",     icon: Settings },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 h-screen border-r border-border bg-surface flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow">
            <Rocket className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-text-primary tracking-tight">BuildOS</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={active ? "nav-item-active" : "nav-item"}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-tertiary">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
