import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type {
  ClaimRecord,
  AuditRecord,
  UserInfo,
  VerifyResult,
  ResourceInfo,
  FilterParams,
  FlowRecord,
  SyncStatus,
  ReviewResult,
  ReviewRecord,
  ProjectStats
} from '@/types/claim'
import {
  mockPendingClaims,
  mockReviewingClaims,
  mockApprovedClaims,
  mockUserInfo,
  mockAuditRecords,
  mockReviewRecords,
  filterOptions
} from '@/data/mockData'

const initialClaims = [...mockPendingClaims, ...mockReviewingClaims, ...mockApprovedClaims]

const taroStorage = {
  getItem: (name: string) => {
    try {
      const value = Taro.getStorageSync(name)
      return value || null
    } catch (e) {
      console.error('[Store] getItem error:', e)
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value)
    } catch (e) {
      console.error('[Store] setItem error:', e)
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch (e) {
      console.error('[Store] removeItem error:', e)
    }
  }
}

interface ClaimStore {
  claims: ClaimRecord[]
  auditRecords: AuditRecord[]
  reviewRecords: ReviewRecord[]
  user: UserInfo
  submittingClaimIds: Set<string>
  reviewingRecordIds: Set<string>
  filterOptions: typeof filterOptions

  getClaimById: (id: string) => ClaimRecord | undefined
  getAuditRecordsByClaimId: (claimId: string) => AuditRecord[]
  getReviewRecordById: (id: string) => ReviewRecord | undefined
  getPendingClaims: () => ClaimRecord[]
  getReviewingClaims: () => ClaimRecord[]
  getApprovedClaims: () => ClaimRecord[]

  filterAuditRecords: (params: FilterParams) => AuditRecord[]

  submitAudit: (params: {
    claimId: string
    result: VerifyResult
    approvedScope: string
    approvedResources: ResourceInfo[]
    remark?: string
  }) => AuditRecord | null

  submitReview: (params: {
    auditRecordId: string
    claimId: string
    result: ReviewResult
    remark?: string
  }) => ReviewRecord | null

  markAsRead: (claimId: string, party: 'contractor' | 'owner') => void

  updateStats: () => void
  isSubmitting: (claimId: string) => boolean
  isReviewing: (auditRecordId: string) => boolean
  getProjectStats: () => ProjectStats[]
  resetStore: () => void
}

const generateTimeString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const syncStatusText: Record<SyncStatus, string> = {
  unsynced: '未同步',
  synced: '已同步',
  read: '已读'
}

export const useClaimStore = create<ClaimStore>()(
  persist(
    (set, get) => ({
      claims: initialClaims,
      auditRecords: mockAuditRecords,
      reviewRecords: mockReviewRecords,
      user: mockUserInfo,
      submittingClaimIds: new Set(),
      reviewingRecordIds: new Set(),
      filterOptions,

      getClaimById: (id) => {
        return get().claims.find((c) => c.id === id)
      },

      getAuditRecordsByClaimId: (claimId) => {
        return get().auditRecords
          .filter((r) => r.claimId === claimId)
          .sort((a, b) => new Date(b.auditTime).getTime() - new Date(a.auditTime).getTime())
      },

      getReviewRecordById: (id) => {
        return get().reviewRecords.find((r) => r.id === id)
      },

      getPendingClaims: () => {
        return get().claims.filter((c) => c.status === 'pending')
      },

      getReviewingClaims: () => {
        return get().claims.filter((c) => c.status === 'reviewing')
      },

      getApprovedClaims: () => {
        return get().claims.filter(
          (c) => c.status === 'approved' || c.status === 'partial' || c.status === 'rejected'
        )
      },

      filterAuditRecords: (params) => {
        let records = [...get().auditRecords]

        if (params.projectName && params.projectName !== 'all') {
          records = records.filter((r) => r.projectName === params.projectName)
        }
        if (params.contractor && params.contractor !== 'all') {
          const claimIds = get()
            .claims.filter((c) => c.contractor === params.contractor)
            .map((c) => c.id)
          records = records.filter((r) => claimIds.includes(r.claimId))
        }
        if (params.reasonCategory && params.reasonCategory !== 'all') {
          const claimIds = get()
            .claims.filter((c) => c.reasonCategory === params.reasonCategory)
            .map((c) => c.id)
          records = records.filter((r) => claimIds.includes(r.claimId))
        }
        if (params.result && params.result !== 'all') {
          records = records.filter((r) => r.result === params.result)
        }
        if (params.startDate) {
          records = records.filter((r) => r.auditTime >= (params.startDate as string))
        }
        if (params.endDate) {
          records = records.filter((r) => r.auditTime <= (params.endDate as string) + ' 23:59')
        }

        return records.sort(
          (a, b) => new Date(b.auditTime).getTime() - new Date(a.auditTime).getTime()
        )
      },

      submitAudit: ({ claimId, result, approvedScope, approvedResources, remark }) => {
        const state = get()

        if (state.submittingClaimIds.has(claimId)) {
          console.warn('[Store] 重复提交拦截:', claimId)
          return null
        }

        const claim = state.claims.find((c) => c.id === claimId)
        if (!claim) {
          console.error('[Store] 事件不存在:', claimId)
          return null
        }

        if (claim.status === 'approved' || claim.status === 'partial' || claim.status === 'rejected') {
          console.warn('[Store] 事件已审核，禁止重复提交:', claimId)
          return null
        }

        set((state) => ({
          submittingClaimIds: new Set(state.submittingClaimIds).add(claimId)
        }))

        try {
          const auditTime = generateTimeString()
          const user = state.user

          const newStatus =
            result === 'true' ? 'approved' : result === 'partial' ? 'partial' : 'rejected'

          const newRecord: AuditRecord = {
            id: `ar_${Date.now()}`,
            claimId,
            claimCode: claim.code,
            projectName: claim.projectName,
            auditor: user.name,
            auditorRole: user.roleName,
            auditTime,
            result,
            approvedScope,
            approvedResources: [...approvedResources],
            remark,
            readStatus: { contractor: false, owner: false }
          }

          const auditFlow: FlowRecord = {
            id: `flow_${claimId}_audit_${Date.now()}`,
            claimId,
            auditRecordId: newRecord.id,
            action: 'audit',
            party: 'supervisor',
            partyName: user.name,
            status: 'synced',
            time: auditTime,
            remark: `监理审核：${result === 'true' ? '属实' : result === 'partial' ? '部分属实' : '不属实'}`
          }

          const syncFlow: FlowRecord = {
            id: `flow_${claimId}_sync_${Date.now()}`,
            claimId,
            auditRecordId: newRecord.id,
            action: 'sync',
            party: 'supervisor',
            partyName: user.name,
            status: 'synced',
            time: auditTime,
            remark: '已同步至施工单位和业主方'
          }

          set((state) => ({
            claims: state.claims.map((c) =>
              c.id === claimId
                ? {
                    ...c,
                    status: newStatus,
                    currentHandler: user.name,
                    syncStatus: {
                      contractor: 'synced',
                      owner: 'synced'
                    },
                    flowRecords: [...c.flowRecords, auditFlow, syncFlow]
                  }
                : c
            ),
            auditRecords: [newRecord, ...state.auditRecords]
          }))

          get().updateStats()

          console.log('[Store] 提交审核成功:', newRecord)
          return newRecord
        } finally {
          set((state) => {
            const newSet = new Set(state.submittingClaimIds)
            newSet.delete(claimId)
            return { submittingClaimIds: newSet }
          })
        }
      },

      markAsRead: (claimId, party) => {
        const time = generateTimeString()

        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  syncStatus: {
                    ...c.syncStatus,
                    [party]: 'read'
                  },
                  flowRecords: [
                    ...c.flowRecords,
                    {
                      id: `flow_${claimId}_read_${Date.now()}`,
                      claimId,
                      action: 'read',
                      party,
                      partyName: party === 'contractor' ? '施工单位' : '业主方',
                      status: 'read',
                      time,
                      remark: `${party === 'contractor' ? '施工单位' : '业主方'}已查看`
                    }
                  ]
                }
              : c
          ),
          auditRecords: state.auditRecords.map((r) =>
            r.claimId === claimId
              ? { ...r, readStatus: { ...r.readStatus, [party]: true } }
              : r
          )
        }))

        console.log('[Store] 标记已读:', claimId, party)
      },

      updateStats: () => {
        const state = get()
        const pending = state.claims.filter((c) => c.status === 'pending').length
        const reviewing = state.claims.filter((c) => c.status === 'reviewing').length
        const approved = state.claims.filter(
          (c) => c.status === 'approved' || c.status === 'partial' || c.status === 'rejected'
        ).length

        set((state) => ({
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              pending,
              reviewing,
              approved,
              total: state.claims.length
            }
          }
        }))
      },

      submitReview: ({ auditRecordId, claimId, result, remark }) => {
        const state = get()

        if (state.reviewingRecordIds.has(auditRecordId)) {
          console.warn('[Store] 重复复核拦截:', auditRecordId)
          return null
        }

        const auditRecord = state.auditRecords.find((r) => r.id === auditRecordId)
        if (!auditRecord) {
          console.error('[Store] 审核记录不存在:', auditRecordId)
          return null
        }

        if (auditRecord.reviewStatus && auditRecord.reviewStatus !== 'pending' && auditRecord.reviewStatus !== 'none') {
          console.warn('[Store] 该记录已完成复核:', auditRecordId)
          return null
        }

        set((state) => ({
          reviewingRecordIds: new Set(state.reviewingRecordIds).add(auditRecordId)
        }))

        try {
          const reviewTime = generateTimeString()
          const user = state.user

          const newReviewRecord: ReviewRecord = {
            id: `rr_${Date.now()}`,
            auditRecordId,
            claimId,
            reviewer: user.name,
            reviewerRole: user.roleName,
            reviewTime,
            result,
            remark
          }

          const newClaimStatus =
            result === 'agree' ? 'archived' : result === 'return' ? 'returned' : 'disputed'

          const reviewFlow: FlowRecord = {
            id: `flow_${claimId}_review_${Date.now()}`,
            claimId,
            auditRecordId,
            reviewRecordId: newReviewRecord.id,
            action: 'review',
            party: 'owner',
            partyName: user.name,
            status: 'synced',
            time: reviewTime,
            remark: `业主复核：${result === 'agree' ? '同意归档' : result === 'return' ? '退回补充' : '发起争议'}`
          }

          set((state) => ({
            claims: state.claims.map((c) =>
              c.id === claimId
                ? {
                    ...c,
                    status: newClaimStatus,
                    currentHandler:
                      result === 'return' ? state.claims.find((cc) => cc.id === claimId)?.submitter : user.name,
                    flowRecords: [...c.flowRecords, reviewFlow]
                  }
                : c
            ),
            auditRecords: state.auditRecords.map((r) =>
              r.id === auditRecordId
                ? { ...r, reviewStatus: result, reviewRecordId: newReviewRecord.id }
                : r
            ),
            reviewRecords: [newReviewRecord, ...state.reviewRecords]
          }))

          console.log('[Store] 提交复核成功:', newReviewRecord)
          return newReviewRecord
        } finally {
          set((state) => {
            const newSet = new Set(state.reviewingRecordIds)
            newSet.delete(auditRecordId)
            return { reviewingRecordIds: newSet }
          })
        }
      },

      isSubmitting: (claimId) => {
        return get().submittingClaimIds.has(claimId)
      },

      isReviewing: (auditRecordId) => {
        return get().reviewingRecordIds.has(auditRecordId)
      },

      getProjectStats: () => {
        const state = get()
        const projectMap = new Map<string, ProjectStats>()

        state.claims.forEach((c) => {
          const name = c.projectName
          if (!projectMap.has(name)) {
            projectMap.set(name, {
              projectName: name,
              totalCount: 0,
              pendingCount: 0,
              reviewingCount: 0,
              approvedCount: 0,
              partialCount: 0,
              rejectedCount: 0,
              reviewingOwnerCount: 0,
              archivedCount: 0,
              disputedCount: 0,
              returnedCount: 0
            })
          }
          const stats = projectMap.get(name)!
          stats.totalCount++
          if (c.status === 'pending') stats.pendingCount++
          else if (c.status === 'reviewing') stats.reviewingCount++
          else if (c.status === 'approved') stats.approvedCount++
          else if (c.status === 'partial') stats.partialCount++
          else if (c.status === 'rejected') stats.rejectedCount++
          else if (c.status === 'reviewing_owner') stats.reviewingOwnerCount++
          else if (c.status === 'archived') stats.archivedCount++
          else if (c.status === 'disputed') stats.disputedCount++
          else if (c.status === 'returned') stats.returnedCount++
        })

        return Array.from(projectMap.values())
      },

      resetStore: () => {
        set({
          claims: initialClaims,
          auditRecords: mockAuditRecords,
          reviewRecords: mockReviewRecords,
          user: mockUserInfo,
          submittingClaimIds: new Set(),
          reviewingRecordIds: new Set()
        })
        Taro.removeStorageSync('claim-audit-store')
        console.log('[Store] 数据已重置')
      }
    }),
    {
      name: 'claim-audit-store',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        claims: state.claims,
        auditRecords: state.auditRecords,
        reviewRecords: state.reviewRecords,
        user: state.user
      })
    }
  )
)

export { syncStatusText }
