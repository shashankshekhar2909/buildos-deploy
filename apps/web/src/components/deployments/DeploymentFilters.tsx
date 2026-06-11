"use client";

export function DeploymentFilters() {
  return (
    <div className="flex gap-2">
      {["All", "Running", "Building", "Failed", "Stopped"].map((s) => (
        <button
          key={s}
          className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
