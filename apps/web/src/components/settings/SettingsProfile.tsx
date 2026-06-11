"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface Props {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function SettingsProfile({ user }: Props) {
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // TODO: PATCH /api/user
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
        <p className="text-xs text-text-tertiary mt-0.5">Your public display name and email</p>
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input max-w-sm"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="input max-w-sm opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-text-tertiary mt-1">Email cannot be changed</p>
        </div>
        <button onClick={handleSave} className="btn-primary btn-md">
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
