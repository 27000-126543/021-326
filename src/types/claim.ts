export type ClaimStatus = 'pending' | 'reviewing' | 'approved' | 'partial' | 'rejected'

export type VerifyResult = 'true' | 'partial' | 'false'

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
  size?: string
  url?: string
}

export interface ClaimRecord {
  id: string
  code: string
  title: string
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
}

export interface AuditRecord {
  id: string
  claimId: string
  claimCode: string
  auditor: string
  auditorRole: string
  auditTime: string
  result: VerifyResult
  approvedScope: string
  approvedResources: ResourceInfo[]
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
