"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { RegisterForm } from "./RegisterForm";
import { cn } from "@/lib/utils";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "register">("signin");

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex border-b border-border">
        {(["signin", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              tab === t
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <div className="p-6">
        {tab === "signin" ? <SignInForm /> : <RegisterForm onSuccess={() => setTab("signin")} />}
      </div>
    </div>
  );
}
