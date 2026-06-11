export type DeploymentStatus =
  | "QUEUED"
  | "BUILDING"
  | "DEPLOYING"
  | "RUNNING"
  | "FAILED"
  | "STOPPED";

export interface Project {
  id: string;
  name: string;
  githubRepo: string;
  branch: string;
  buildCommand?: string;
  startCommand?: string;
  port: number;
  envVars: Record<string, string>;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deployments?: Deployment[];
}

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  commitSha?: string;
  commitMessage?: string;
  imageTag?: string;
  containerId?: string;
  url?: string;
  logs?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, "id" | "name" | "githubRepo">;
}

export interface Domain {
  id: string;
  domain: string;
  projectId: string;
  verified: boolean;
  sslEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, "id" | "name">;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  githubLogin?: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
