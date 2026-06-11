import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsSecurity } from "@/components/settings/SettingsSecurity";
import { SettingsDanger } from "@/components/settings/SettingsDanger";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-desc">Manage your account preferences</p>
      </div>
      <SettingsProfile user={session?.user} />
      <SettingsSecurity />
      <SettingsDanger />
    </div>
  );
}
