import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import ClaimCard from '@/components/ClaimCard'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { ClaimRecord } from '@/types/claim'

type FilterType = 'all' | 'pending' | 'reviewing'

const PendingPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const claims = useClaimStore((state) => state.claims)

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

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 500)
  }

  React.useEffect(() => {
    const pullDownRefresh = () => {
      handleRefresh()
    }
    Taro.onPullDownRefresh(pullDownRefresh)
    return () => {
      Taro.offPullDownRefresh(pullDownRefresh)
    }
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

      <View className={styles.listContainer}>
        {list.length > 0 ? (
          list.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无待审事件</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default PendingPage
