import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { ClaimRecord, AuditRecord, UserInfo, VerifyResult, ResourceInfo } from '@/types/claim'
import { mockPendingClaims, mockReviewingClaims, mockApprovedClaims, mockUserInfo, mockAuditRecords } from '@/data/mockData'

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

  getClaimById: (id: string) => ClaimRecord | undefined
  getAuditRecordsByClaimId: (claimId: string) => AuditRecord[]
  getPendingClaims: () => ClaimRecord[]
  getReviewingClaims: () => ClaimRecord[]
  getApprovedClaims: () => ClaimRecord[]

  submitAudit: (params: {
    claimId: string
    result: VerifyResult
    approvedScope: string
    approvedResources: ResourceInfo[]
    remark?: string
  }) => AuditRecord

  updateStats: () => void
  resetStore: () => void
}

export const useClaimStore = create<ClaimStore>()(
  persist(
    (set, get) => ({
      claims: initialClaims,
      auditRecords: mockAuditRecords,
      user: mockUserInfo,

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

      submitAudit: ({ claimId, result, approvedScope, approvedResources, remark }) => {
        const now = new Date()
        const auditTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const newStatus =
          result === 'true' ? 'approved' : result === 'partial' ? 'partial' : 'rejected'

        const claim = get().claims.find((c) => c.id === claimId)
        const user = get().user

        const newRecord: AuditRecord = {
          id: `ar_${Date.now()}`,
          claimId,
          claimCode: claim?.code || '',
          auditor: user.name,
          auditorRole: user.roleName,
          auditTime,
          result,
          approvedScope,
          approvedResources,
          remark
        }

        set((state) => ({
          claims: state.claims.map((c) =>
            c.id === claimId ? { ...c, status: newStatus, currentHandler: user.name } : c
          ),
          auditRecords: [newRecord, ...state.auditRecords]
        }))

        get().updateStats()

        console.log('[Store] 提交审核成功:', newRecord)
        return newRecord
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

      resetStore: () => {
        set({
          claims: initialClaims,
          auditRecords: mockAuditRecords,
          user: mockUserInfo
        })
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
