"use client";

const filters = ["All", "Running", "Building", "Deploying", "Failed", "Stopped", "Queued"] as const;
type Filter = typeof filters[number];

interface Props {
  active: Filter;
  onChange: (f: Filter) => void;
}

export function DeploymentFilters({ active, onChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {filters.map(f => (
        <button key={f} onClick={() => onChange(f)}
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
