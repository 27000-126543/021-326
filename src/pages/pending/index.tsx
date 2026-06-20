import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import ClaimCard from '@/components/ClaimCard'
import styles from './index.module.scss'
import { mockPendingClaims, mockReviewingClaims } from '@/data/mockData'
import type { ClaimRecord } from '@/types/claim'

type FilterType = 'all' | 'pending' | 'reviewing'

const PendingPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [list, setList] = useState<ClaimRecord[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    setLoading(true)
    setTimeout(() => {
      let data: ClaimRecord[] = []
      if (filter === 'all') {
        data = [...mockPendingClaims, ...mockReviewingClaims]
      } else if (filter === 'pending') {
        data = mockPendingClaims
      } else {
        data = mockReviewingClaims
      }
      setList(data)
      setLoading(false)
      Taro.stopPullDownRefresh()
    }, 500)
  }

  useEffect(() => {
    loadData()
  }, [filter])

  useEffect(() => {
    const pullDownRefresh = () => {
      loadData()
    }
    Taro.onPullDownRefresh(pullDownRefresh)
    return () => {
      Taro.offPullDownRefresh(pullDownRefresh)
    }
  }, [filter])

  const pendingCount = mockPendingClaims.length
  const reviewingCount = mockReviewingClaims.length
  const totalCount = pendingCount + reviewingCount

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
