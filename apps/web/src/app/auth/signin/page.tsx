import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">BuildOS Deploy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Self-hosted deployment platform
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
