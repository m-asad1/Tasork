import type { ProjectRequestStatus, ProjectStatus, ProposalStatus, UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface ProjectRequest {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  budgetRange?: string | null;
  deadline?: string | null;
  status: ProjectRequestStatus;
  createdAt: string;
}

export interface Proposal {
  id: string;
  requestId: string;
  price: number;
  currency: string;
  timelineDays: number;
  scope: string;
  revisionPolicy: string;
  status: ProposalStatus;
  expiresAt: string;
  createdAt: string;
}

export interface Project {
  id: string;
  requestId: string;
  proposalId: string;
  status: ProjectStatus;
  progressPercent: number;
  createdAt: string;
}
