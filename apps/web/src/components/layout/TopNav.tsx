"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut, ChevronDown, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TopNavProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function TopNav({ user }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="h-12 border-b border-border bg-surface px-5 flex items-center justify-end shrink-0">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-raised transition-colors"
        >
          {user?.image ? (
            <Image src={user.image} alt={user.name || ""} width={22} height={22} className="rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <User className="w-3 h-3 text-accent" />
            </div>
          )}
          <span className="text-sm text-text-primary font-medium">{user?.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 animate-in">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-text hover:bg-danger/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
