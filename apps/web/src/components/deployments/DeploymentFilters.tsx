"use client";

import { useState } from "react";

const filters = ["All", "Running", "Building", "Failed", "Stopped"];

export function DeploymentFilters() {
  const [active, setActive] = useState("All");
  return (
    <div className="flex gap-1.5">
      {filters.map(f => (
        <button key={f} onClick={() => setActive(f)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            active === f
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border"
          }`}>
          {f}
        </button>
      ))}
    </div>
  );
}
