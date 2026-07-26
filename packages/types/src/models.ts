import type {
  ActivityType,
  CouponType,
  DisputeStatus,
  FileScanStatus,
  FileVisibility,
  InvoiceStatus,
  MilestoneStatus,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProjectRequestStatus,
  ProjectRole,
  ProjectStatus,
  ProposalStatus,
  RefundStatus,
  UserRole,
} from './enums';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
}

export interface ProfileCompletion {
  percent: number;
  missingFields: string[];
}

export interface ActiveSession {
  id: string;
  label: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  isCurrent: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface LoginHistoryEntry {
  id: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
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
  declineReason?: string | null;
  createdAt: string;
}

export interface ProjectActivityLogEntry {
  id: string;
  type: ActivityType;
  message: string;
  actorId?: string | null;
  actorName?: string | null;
  createdAt: string;
}

export interface ProposalDeliverable {
  id: string;
  title: string;
  description?: string | null;
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  order: number;
  dueDate?: string | null;
  status: MilestoneStatus;
}

export interface Proposal {
  id: string;
  requestId: string;
  version: number;
  price: number;
  currency: string;
  timelineDays: number;
  scope: string;
  revisionPolicy: string;
  status: ProposalStatus;
  expiresAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  deliverables: ProposalDeliverable[];
  milestones: Milestone[];
}

export interface Project {
  id: string;
  requestId: string;
  proposalId: string;
  status: ProjectStatus;
  progressPercent: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  provider: PaymentProvider;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  projectId: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt?: string | null;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  expiresAt?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  body: string;
  createdAt: string;
  editedAt?: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface FileAsset {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  visibility: FileVisibility;
  scanStatus: FileScanStatus;
  url: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  subject: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  role: ProjectRole;
}
