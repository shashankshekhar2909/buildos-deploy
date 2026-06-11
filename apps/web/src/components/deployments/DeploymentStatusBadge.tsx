const statusMap: Record<string, { cls: string; dot: string; label: string }> = {
  RUNNING:   { cls: "badge-running",   dot: "bg-success animate-pulse", label: "Running" },
  BUILDING:  { cls: "badge-building",  dot: "bg-info animate-spin-slow", label: "Building" },
  DEPLOYING: { cls: "badge-deploying", dot: "bg-info animate-pulse",    label: "Deploying" },
  QUEUED:    { cls: "badge-queued",    dot: "bg-warning",               label: "Queued" },
  FAILED:    { cls: "badge-failed",    dot: "bg-danger",                label: "Failed" },
  STOPPED:   { cls: "badge-stopped",   dot: "bg-text-tertiary",         label: "Stopped" },
};

export function DeploymentStatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? { cls: "badge-stopped", dot: "bg-text-tertiary", label: status };
  return (
    <span className={s.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
