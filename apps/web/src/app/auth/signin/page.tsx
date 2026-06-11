import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthTabs } from "@/components/auth/AuthTabs";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
              B
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BuildOS Deploy</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Self-hosted deployment platform
          </p>
        </div>
        <AuthTabs />
      </div>
    </div>
  );
}
