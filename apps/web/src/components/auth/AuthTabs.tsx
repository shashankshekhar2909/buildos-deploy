"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { RegisterForm } from "./RegisterForm";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "register">("signin");

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["signin", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t
                ? "text-text-primary border-b-2 border-accent -mb-px"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "signin"
          ? <SignInForm />
          : <RegisterForm onSuccess={() => setTab("signin")} />
        }
      </div>
    </div>
  );
}
