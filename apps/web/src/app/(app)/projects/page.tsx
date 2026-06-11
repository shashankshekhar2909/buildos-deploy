import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectButton } from "@/components/projects/NewProjectButton";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Projects</h1>
          <p className="page-desc">Connect GitHub repos and deploy them</p>
        </div>
        <NewProjectButton />
      </div>
      <ProjectList />
    </div>
  );
}
