import { DeploymentList } from "@/components/deployments/DeploymentList";

export default function DeploymentsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Deployments</h1>
        <p className="page-desc">All deployments across projects</p>
      </div>
      <DeploymentList />
    </div>
  );
}
