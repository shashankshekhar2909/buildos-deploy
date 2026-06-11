import { DeploymentList } from "@/components/deployments/DeploymentList";
import { DeploymentFilters } from "@/components/deployments/DeploymentFilters";

export default function DeploymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Deployments</h2>
        <p className="text-muted-foreground">All deployments across projects</p>
      </div>
      <DeploymentFilters />
      <DeploymentList />
    </div>
  );
}
