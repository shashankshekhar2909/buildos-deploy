import { ProjectList } from "@/components/projects/ProjectList";
import { NewProjectButton } from "@/components/projects/NewProjectButton";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your GitHub repositories</p>
        </div>
        <NewProjectButton />
      </div>
      <ProjectList />
    </div>
  );
}
