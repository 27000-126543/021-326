import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { mockReviewingClaims } from '@/data/mockData'
import type { ClaimRecord } from '@/types/claim'

const VerifyPage: React.FC = () => {
  const [verifyingList, setVerifyingList] = useState<ClaimRecord[]>([])

  const loadData = () => {
    setVerifyingList(mockReviewingClaims)
  }

  useDidShow(() => {
    loadData()
  })

  useEffect(() => {
    loadData()
  }, [])

  const handleScanCode = () => {
    Taro.scanCode({
      success: (res) => {
        console.log('[Verify] 扫码结果:', res.result)
        Taro.showToast({
          title: '扫码成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('[Verify] 扫码失败:', err)
        Taro.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  }

  const handleContinueVerify = (id: string) => {
    Taro.navigateTo({
      url: `/pages/audit/index?id=${id}`
    })
  }

  const handleNewVerify = () => {
    Taro.showToast({
      title: '请先选择待审事件',
      icon: 'none'
    })
    Taro.switchTab({
      url: '/pages/pending/index'
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>现场核验</Text>
        <Text className={styles.headerSubtitle}>快速确认施工事实，提高审核效率</Text>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={handleScanCode}>
          <View className={styles.actionIcon}>📷</View>
          <Text className={styles.actionText}>扫码核验</Text>
        </View>
        <View className={styles.actionCard} onClick={handleNewVerify}>
          <View className={styles.actionIcon}>✅</View>
          <Text className={styles.actionText}>新建核验</Text>
        </View>
      </View>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>💡 核验提示</Text>
        <Text className={styles.tipsText}>
          现场核验时请仔细核对人员、机械数量和停工部位，确保事实准确。核验结果将同步给施工单位和业主方。
        </Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>进行中核验</Text>
          <Text className={styles.sectionMore}>共 {verifyingList.length} 项</Text>
        </View>

        {verifyingList.length > 0 ? (
          verifyingList.map((claim) => (
            <View key={claim.id} className={styles.verifyingCard}>
              <View className={styles.verifyingHeader}>
                <Text className={styles.verifyingCode}>{claim.code}</Text>
                <View className={styles.verifyingBadge}>核验中</View>
              </View>
              <Text className={styles.verifyingTitle}>{claim.title}</Text>
              <View className={styles.verifyingInfo}>
                <Text>部位：{claim.stopLocation}{'\n'}</Text>
                <Text>日期：{claim.stopDate}{'\n'}</Text>
                <Text>施工单位：{claim.contractor}</Text>
              </View>
              <View className={styles.verifyingFooter}>
                <View
                  className={classnames(styles.verifyBtn, styles.secondary)}
                  onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${claim.id}` })}
                >
                  查看详情
                </View>
                <View
                  className={styles.verifyBtn}
                  onClick={() => handleContinueVerify(claim.id)}
                >
                  继续核验
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>暂无进行中的核验</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default VerifyPage
