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
  SyncStatus
} from '@/types/claim'
import {
  mockPendingClaims,
  mockReviewingClaims,
  mockApprovedClaims,
  mockUserInfo,
  mockAuditRecords,
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
  user: UserInfo
  submittingClaimIds: Set<string>
  filterOptions: typeof filterOptions

  getClaimById: (id: string) => ClaimRecord | undefined
  getAuditRecordsByClaimId: (claimId: string) => AuditRecord[]
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

  markAsRead: (claimId: string, party: 'contractor' | 'owner') => void

  updateStats: () => void
  isSubmitting: (claimId: string) => boolean
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
      user: mockUserInfo,
      submittingClaimIds: new Set(),
      filterOptions,

      getClaimById: (id) => {
        return get().claims.find((c) => c.id === id)
      },

      getAuditRecordsByClaimId: (claimId) => {
        return get().auditRecords
          .filter((r) => r.claimId === claimId)
          .sort((a, b) => new Date(b.auditTime).getTime() - new Date(a.auditTime).getTime())
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
          records = records.filter((r) => r.auditTime >= params.startDate)
        }
        if (params.endDate) {
          records = records.filter((r) => r.auditTime <= params.endDate + ' 23:59')
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

      isSubmitting: (claimId) => {
        return get().submittingClaimIds.has(claimId)
      },

      resetStore: () => {
        set({
          claims: initialClaims,
          auditRecords: mockAuditRecords,
          user: mockUserInfo,
          submittingClaimIds: new Set()
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
        user: state.user
      })
    }
  )
)

export { syncStatusText }
