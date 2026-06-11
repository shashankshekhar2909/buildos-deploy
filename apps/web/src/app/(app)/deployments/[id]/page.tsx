import { DeploymentDetail } from "@/components/deployments/DeploymentDetail";
import { DeploymentLogs } from "@/components/deployments/DeploymentLogs";

export default function DeploymentPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <DeploymentDetail id={params.id} />
      <DeploymentLogs deploymentId={params.id} />
    </div>
  );
}
