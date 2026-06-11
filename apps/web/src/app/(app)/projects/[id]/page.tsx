import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectDeployments } from "@/components/projects/ProjectDeployments";
import { ProjectEnvVars } from "@/components/projects/ProjectEnvVars";
import { DeployButton } from "@/components/projects/DeployButton";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      deployments: { orderBy: { createdAt: "desc" }, take: 20 },
      domains: { take: 1 },
    },
  });
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">{project.name}</h1>
          <p className="page-desc">{project.githubRepo}</p>
        </div>
        <div className="flex gap-2">
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
          <DeployButton projectId={project.id} />
        </div>
      </div>
      <ProjectDetail project={project} />
      <ProjectEnvVars projectId={project.id} initialVars={project.envVars as Record<string, string>} />
      <ProjectDeployments deployments={project.deployments} />
    </div>
  );
}
