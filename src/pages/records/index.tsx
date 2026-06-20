import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { AuditRecord, VerifyResult } from '@/types/claim'

type FilterType = 'all' | 'true' | 'partial' | 'false'

const resultMap: Record<VerifyResult, string> = {
  true: '属实',
  partial: '部分属实',
  false: '不属实'
}

const RecordsPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all')
  const auditRecords = useClaimStore((state) => state.auditRecords)
  const user = useClaimStore((state) => state.user)

  useDidShow(() => {
    console.log('[Records] 页面显示，记录数:', auditRecords.length)
  })

  const filteredRecords = filter === 'all'
    ? auditRecords
    : auditRecords.filter((r) => r.result === filter)

  const totalCount = auditRecords.length
  const trueCount = auditRecords.filter((r) => r.result === 'true').length
  const partialCount = auditRecords.filter((r) => r.result === 'partial').length
  const falseCount = auditRecords.filter((r) => r.result === 'false').length

  const handleCardClick = (record: AuditRecord) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${record.claimId}&from=records`
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.statsHeader}>
        <Text className={styles.headerTitle}>已审记录</Text>
        <Text className={styles.headerSubtitle}>历史审核记录查询</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{totalCount}</Text>
            <Text className={styles.statLabel}>总计</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{trueCount}</Text>
            <Text className={styles.statLabel}>属实</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{partialCount}</Text>
            <Text className={styles.statLabel}>部分</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{falseCount}</Text>
            <Text className={styles.statLabel}>不属实</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        <View
          className={classnames(styles.tabItem, filter === 'all' && styles.active)}
          onClick={() => setFilter('all')}
        >
          全部
        </View>
        <View
          className={classnames(styles.tabItem, filter === 'true' && styles.active)}
          onClick={() => setFilter('true')}
        >
          属实
        </View>
        <View
          className={classnames(styles.tabItem, filter === 'partial' && styles.active)}
          onClick={() => setFilter('partial')}
        >
          部分
        </View>
        <View
          className={classnames(styles.tabItem, filter === 'false' && styles.active)}
          onClick={() => setFilter('false')}
        >
          不属实
        </View>
      </View>

      <View className={styles.listContainer}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <View
              key={record.id}
              className={styles.auditCard}
              onClick={() => handleCardClick(record)}
            >
              <View className={styles.auditHeader}>
                <Text className={styles.auditCode}>{record.claimCode}</Text>
                <View className={classnames(styles.resultTag, styles[record.result])}>
                  {resultMap[record.result]}
                </View>
              </View>
              <Text className={styles.auditTitle}>{record.approvedScope}</Text>
              <View className={styles.auditInfo}>
                <Text>审核人：{record.auditor}（{record.auditorRole}）</Text>
              </View>
              {record.remark && (
                <View className={styles.scopeBox}>
                  <Text className={styles.scopeLabel}>备注</Text>
                  <Text className={styles.scopeText}>{record.remark}</Text>
                </View>
              )}
              <View className={styles.auditFooter}>
                <Text className={styles.auditorInfo}>{record.auditorRole}</Text>
                <Text className={styles.auditTime}>{record.auditTime}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无审核记录</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default RecordsPage
