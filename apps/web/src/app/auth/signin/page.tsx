import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { Rocket } from "lucide-react";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent mb-4 shadow-glow">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">BuildOS Deploy</h1>
          <p className="text-sm text-text-secondary mt-1">
            Self-hosted deployment platform
          </p>
        </div>

        <AuthTabs />

        <p className="text-center text-xs text-text-tertiary mt-6">
          Your data stays on your infrastructure
        </p>
      </div>
    </div>
  );
}
