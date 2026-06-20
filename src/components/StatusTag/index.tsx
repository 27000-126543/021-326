import React from 'react'
import { View } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { ClaimStatus } from '@/types/claim'

interface StatusTagProps {
  status: ClaimStatus
}

const statusMap: Record<ClaimStatus, string> = {
  pending: '待审核',
  reviewing: '核验中',
  approved: '已确认',
  partial: '部分认可',
  rejected: '不认可',
  reviewing_owner: '业主复核中',
  archived: '已归档',
  disputed: '争议中',
  returned: '退回补充'
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  return (
    <View className={classnames(styles.statusTag, styles[status])}>
      {statusMap[status]}
    </View>
  )
}

export default StatusTag
