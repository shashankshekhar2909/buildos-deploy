export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-border px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-xs text-text-tertiary">
          BuildOS Deploy <span className="text-text-tertiary/50">v0.1.0</span>
        </span>
        <span className="text-text-tertiary/30">·</span>
        <a
          href="https://github.com/shashankshekhar2909/buildos-deploy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
        <span className="text-text-tertiary/30">·</span>
        <a href="/docs" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          Docs
        </a>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span className="text-xs text-text-tertiary">All systems operational</span>
      </div>
    </footer>
  );
}
