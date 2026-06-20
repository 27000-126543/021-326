import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import ClaimCard from '@/components/ClaimCard'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { ClaimRecord } from '@/types/claim'

type FilterType = 'all' | 'pending' | 'reviewing'
type ViewMode = 'list' | 'project'

const PendingPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const claims = useClaimStore((state) => state.claims)
  const getProjectStats = useClaimStore((state) => state.getProjectStats)

  useDidShow(() => {
    console.log('[Pending] 页面显示，数据已刷新')
  })

  const pendingClaims = claims.filter((c) => c.status === 'pending')
  const reviewingClaims = claims.filter((c) => c.status === 'reviewing')
  const pendingCount = pendingClaims.length
  const reviewingCount = reviewingClaims.length
  const totalCount = pendingCount + reviewingCount

  const getFilteredList = (): ClaimRecord[] => {
    if (filter === 'all') {
      return [...pendingClaims, ...reviewingClaims]
    } else if (filter === 'pending') {
      return pendingClaims
    } else {
      return reviewingClaims
    }
  }

  const list = getFilteredList()

  const projectStats = useMemo(() => getProjectStats(), [claims])

  const claimsByProject = useMemo(() => {
    const map = new Map<string, ClaimRecord[]>()
    list.forEach((c) => {
      if (!map.has(c.projectName)) map.set(c.projectName, [])
      map.get(c.projectName)!.push(c)
    })
    return map
  }, [list])

  React.useEffect(() => {
    console.log('[Pending] 下拉刷新演示')
  }, [])

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>待审事件</Text>
        <Text className={styles.headerSubtitle}>共 {totalCount} 条待处理</Text>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{totalCount}</Text>
            <Text className={styles.statLabel}>全部待审</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{reviewingCount}</Text>
            <Text className={styles.statLabel}>核验中</Text>
          </View>
        </View>
      </View>

      <View className={styles.toolbar}>
        <View className={styles.modeSwitch}>
          <View
            className={classnames(styles.modeBtn, viewMode === 'list' && styles.active)}
            onClick={() => setViewMode('list')}
          >
            列表
          </View>
          <View
            className={classnames(styles.modeBtn, viewMode === 'project' && styles.active)}
            onClick={() => setViewMode('project')}
          >
            按项目
          </View>
        </View>

        <View className={styles.filterBar}>
          <View
            className={classnames(styles.filterItem, filter === 'all' && styles.active)}
            onClick={() => setFilter('all')}
          >
            全部
          </View>
          <View
            className={classnames(styles.filterItem, filter === 'pending' && styles.active)}
            onClick={() => setFilter('pending')}
          >
            待审核
          </View>
          <View
            className={classnames(styles.filterItem, filter === 'reviewing' && styles.active)}
            onClick={() => setFilter('reviewing')}
          >
            核验中
          </View>
        </View>
      </View>

      <View className={styles.listContainer}>
        {viewMode === 'list' ? (
          list.length > 0 ? (
            list.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无待审事件</Text>
            </View>
          )
        ) : (
          projectStats.length > 0 ? (
            projectStats
              .filter((stats) => (stats.pendingCount + stats.reviewingCount) > 0)
              .map((stats) => {
                const projectClaims = claimsByProject.get(stats.projectName) || []
                const pendingTotal = stats.pendingCount + stats.reviewingCount
                if (pendingTotal === 0) return null

                return (
                  <View key={stats.projectName} className={styles.projectCard}>
                    <View className={styles.projectHeader}>
                      <Text className={styles.projectName}>{stats.projectName}</Text>
                      <Text className={styles.projectTotal}>{pendingTotal} 条待处理</Text>
                    </View>
                    <View className={styles.projectStats}>
                      <View className={styles.projectStat}>
                        <Text className={styles.projectStatNum}>{stats.pendingCount}</Text>
                        <Text className={styles.projectStatLabel}>待审核</Text>
                      </View>
                      <View className={styles.projectStatDivider} />
                      <View className={styles.projectStat}>
                        <Text className={styles.projectStatNum}>{stats.reviewingCount}</Text>
                        <Text className={styles.projectStatLabel}>核验中</Text>
                      </View>
                      <View className={styles.projectStatDivider} />
                      <View className={styles.projectStat}>
                        <Text className={styles.projectStatNum} style={{ color: '#14ae5c' }}>
                          {stats.approvedCount}
                        </Text>
                        <Text className={styles.projectStatLabel}>已确认</Text>
                      </View>
                      <View className={styles.projectStatDivider} />
                      <View className={styles.projectStat}>
                        <Text className={styles.projectStatNum} style={{ color: '#f77234' }}>
                          {stats.partialCount}
                        </Text>
                        <Text className={styles.projectStatLabel}>部分认可</Text>
                      </View>
                    </View>
                    {projectClaims.length > 0 && (
                      <View className={styles.projectClaims}>
                        <Text className={styles.projectClaimsTitle}>待处理事件（{projectClaims.length}）</Text>
                        {projectClaims.slice(0, 3).map((claim) => (
                          <ClaimCard key={claim.id} claim={claim} compact />
                        ))}
                        {projectClaims.length > 3 && (
                          <View className={styles.projectMoreBtn}>
                            查看全部 {projectClaims.length} 条 →
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )
              })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🏗️</Text>
              <Text className={styles.emptyText}>暂无项目数据</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  )
}

export default PendingPage
