import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentDeployments } from "@/components/deployments/RecentDeployments";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your deployments</p>
      </div>
      <DashboardStats />
      <RecentDeployments />
    </div>
  );
}
