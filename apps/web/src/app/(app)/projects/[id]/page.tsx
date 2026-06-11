import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectDeployments } from "@/components/projects/ProjectDeployments";
import { ProjectEnvVars } from "@/components/projects/ProjectEnvVars";

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
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <p className="page-desc">{project.githubRepo || "No repository"}</p>
      </div>
      <ProjectDetail project={project} />
      <ProjectEnvVars projectId={project.id} />
      <ProjectDeployments deployments={project.deployments} />
    </div>
  );
}
