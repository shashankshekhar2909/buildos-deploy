"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";

export function SettingsDanger() {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="card border-danger/20">
      <div className="px-5 py-4 border-b border-danger/20">
        <h2 className="text-sm font-semibold text-danger-text flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger zone
        </h2>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Delete account</p>
            <p className="text-xs text-text-tertiary mt-0.5">Permanently delete your account and all projects</p>
          </div>
          {!confirm ? (
            <button onClick={() => setConfirm(true)} className="btn-danger btn-sm">Delete account</button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-danger-text">Are you sure?</span>
              <button className="btn-danger btn-sm">Yes, delete</button>
              <button onClick={() => setConfirm(false)} className="btn-secondary btn-sm">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
