import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentDeployments } from "@/components/deployments/RecentDeployments";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-desc">Monitor your deployments and infrastructure</p>
      </div>
      <DashboardStats />
      <RecentDeployments />
    </div>
  );
}
