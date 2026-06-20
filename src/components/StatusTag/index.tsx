import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ClaimStatus } from '@/types/claim'

interface StatusTagProps {
  status: ClaimStatus
  size?: 'sm' | 'md'
}

const statusMap: Record<ClaimStatus, string> = {
  pending: '待审核',
  reviewing: '核验中',
  approved: '已确认',
  partial: '部分认可',
  rejected: '不认可'
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  return (
    <View className={classnames(styles.statusTag, styles[status])}>
      {statusMap[status]}
    </View>
  )
}

export default StatusTag
