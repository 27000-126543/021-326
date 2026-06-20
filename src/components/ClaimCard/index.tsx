import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'
import type { ClaimRecord } from '@/types/claim'

interface ClaimCardProps {
  claim: ClaimRecord
  onClick?: () => void
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${claim.id}`
      })
    }
  }

  return (
    <View className={styles.claimCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.codeText}>{claim.code}</Text>
        <StatusTag status={claim.status} />
      </View>

      <View className={styles.titleRow}>
        <Text className={styles.titleText}>{claim.title}</Text>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>停工日期：</Text>
          <Text className={styles.infoValue}>{claim.stopDate}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>停工部位：</Text>
          <Text className={styles.infoValue}>{claim.stopLocation}</Text>
        </View>
      </View>

      <View className={styles.reasonText}>
        原因：{claim.reason}
      </View>

      <View className={styles.resourceList}>
        {claim.resources.slice(0, 3).map((res, index) => (
          <View key={index} className={styles.resourceTag}>
            {res.name} {res.count}{res.unit}
          </View>
        ))}
        {claim.resources.length > 3 && (
          <View className={styles.resourceTag}>
            +{claim.resources.length - 3}项
          </View>
        )}
      </View>

      <View className={styles.footerRow}>
        <Text className={styles.contractorText}>{claim.contractor}</Text>
        <Text className={styles.dateText}>{claim.submitDate}</Text>
      </View>
    </View>
  )
}

export default ClaimCard
