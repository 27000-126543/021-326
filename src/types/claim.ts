export type ClaimStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'partial'
  | 'rejected'
  | 'reviewing_owner'
  | 'archived'
  | 'disputed'
  | 'returned'

export type VerifyResult = 'true' | 'partial' | 'false'

export type ReviewResult = 'agree' | 'return' | 'dispute'

export type SyncStatus = 'unsynced' | 'synced' | 'read'

export type PartyType = 'contractor' | 'owner' | 'supervisor'

export interface FlowRecord {
  id: string
  claimId: string
  auditRecordId?: string
  reviewRecordId?: string
  action: 'submit' | 'audit' | 'sync' | 'read' | 'review' | 'archive' | 'comment'
  party: PartyType
  partyName: string
  status: SyncStatus
  time: string
  remark?: string
}

export interface ResourceInfo {
  type: string
  name: string
  count: number
  unit: string
  duration?: number
  durationUnit?: string
}

export interface Attachment {
  id: string
  name: string
  type: 'image' | 'pdf' | 'doc'
  category: 'photo' | 'notice' | 'agreement' | 'attendance' | 'plan' | 'contract' | 'other'
  categoryName: string
  size?: string
  url?: string
}

export interface ClaimRecord {
  id: string
  code: string
  title: string
  projectName: string
  contractor: string
  submitDate: string
  stopDate: string
  stopLocation: string
  reason: string
  reasonCategory: string
  resources: ResourceInfo[]
  attachments: Attachment[]
  attachmentSummary: string
  status: ClaimStatus
  currentHandler?: string
  submitter: string
  submitterPhone?: string
  syncStatus: {
    contractor: SyncStatus
    owner: SyncStatus
  }
  flowRecords: FlowRecord[]
}

export interface AuditRecord {
  id: string
  claimId: string
  claimCode: string
  projectName: string
  auditor: string
  auditorRole: string
  auditTime: string
  result: VerifyResult
  approvedScope: string
  approvedResources: ResourceInfo[]
  remark?: string
  readStatus: {
    contractor: boolean
    owner: boolean
  }
  reviewStatus?: ReviewResult | 'pending' | 'none'
  reviewRecordId?: string
}

export interface ReviewRecord {
  id: string
  auditRecordId: string
  claimId: string
  reviewer: string
  reviewerRole: string
  reviewTime: string
  result: ReviewResult
  remark?: string
}

export interface UserInfo {
  id: string
  name: string
  role: 'supervisor' | 'owner' | 'contractor'
  roleName: string
  company: string
  phone: string
  avatar?: string
  stats: {
    pending: number
    reviewing: number
    approved: number
    total: number
  }
}

export interface FilterParams {
  projectName?: string
  contractor?: string
  reasonCategory?: string
  result?: VerifyResult | 'all'
  startDate?: string
  endDate?: string
}

export interface ProjectStats {
  projectName: string
  totalCount: number
  pendingCount: number
  reviewingCount: number
  approvedCount: number
  partialCount: number
  rejectedCount: number
  reviewingOwnerCount: number
  archivedCount: number
  disputedCount: number
  returnedCount: number
}
