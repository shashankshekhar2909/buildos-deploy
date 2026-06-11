"use client";

import { useState } from "react";
import { User, Eye, EyeOff, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Props {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function SettingsProfile({ user }: Props) {
  const [name, setName] = useState(user?.name || "");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      await apiClient.patch("/api/user", {
        name: name || undefined,
        ...(githubToken ? { githubToken } : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError("Failed to save"); }
    setSaving(false);
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
        <p className="text-xs text-text-tertiary mt-0.5">Your display name, email, and integrations</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-tertiary">{user?.email}</p>
          </div>
        </div>
        <div>
          <label className="label">Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input max-w-sm" placeholder="Your name" />
        </div>
        <div>
          <label className="label">Email</label>
          <input value={user?.email || ""} disabled className="input max-w-sm opacity-50 cursor-not-allowed" />
          <p className="text-xs text-text-tertiary mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="label">GitHub Personal Access Token</label>
          <div className="relative max-w-sm">
            <input
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              type={showToken ? "text" : "password"}
              className="input pr-9"
              placeholder="ghp_xxxxxxxxxxxx (for private repos)"
            />
            <button onClick={() => setShowToken(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-text-tertiary mt-1">Needs repo read scope. Leave blank to keep existing token.</p>
        </div>
        {error && <p className="text-sm text-danger-text">{error}</p>}
        <button onClick={handleSave} disabled={saving} className="btn-primary btn-md">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
