import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'
import { mockAllClaims, mockAuditRecords } from '@/data/mockData'
import type { ClaimRecord, AuditRecord } from '@/types/claim'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimRecord | null>(null)
  const [auditRecord, setAuditRecord] = useState<AuditRecord | null>(null)

  useEffect(() => {
    const id = router.params.id
    console.log('[Detail] 事件ID:', id)

    const found = mockAllClaims.find((c) => c.id === id)
    if (found) {
      setClaim(found)
    } else {
      const firstClaim = mockAllClaims[0]
      setClaim(firstClaim)
    }

    const audit = mockAuditRecords.find((a) => a.claimId === id)
    if (audit) {
      setAuditRecord(audit)
    }
  }, [router.params.id])

  const handleStartAudit = () => {
    if (claim) {
      Taro.navigateTo({
        url: `/pages/audit/index?id=${claim.id}`
      })
    }
  }

  const handlePreviewAttachment = (name: string) => {
    console.log('[Detail] 预览附件:', name)
    Taro.showToast({
      title: '预览功能开发中',
      icon: 'none'
    })
  }

  if (!claim) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const isAudited = claim.status === 'approved' || claim.status === 'partial' || claim.status === 'rejected'

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.sectionCard}>
        <View className={styles.codeRow}>
          <Text className={styles.codeText}>{claim.code}</Text>
          <StatusTag status={claim.status} />
        </View>
        <Text className={styles.titleText}>{claim.title}</Text>
        <View className={styles.contractorRow}>
          <Text>{claim.contractor}</Text>
          <View className={styles.submitterInfo}>
            <Text>提交人：{claim.submitter}</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>停工日期</Text>
            <Text className={styles.infoValue}>{claim.stopDate}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>停工部位</Text>
            <Text className={styles.infoValue}>{claim.stopLocation}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>提交时间</Text>
            <Text className={styles.infoValue}>{claim.submitDate}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>当前处理</Text>
            <Text className={styles.infoValue}>{claim.currentHandler || '-'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>停工原因</Text>
        <View className={styles.reasonBox}>
          <Text className={styles.reasonCategory}>{claim.reasonCategory}</Text>
          <Text className={styles.reasonText}>{claim.reason}</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>人员机械</Text>
        <View className={styles.resourceSection}>
          <View className={styles.resourceTable}>
            <View className={styles.tableHeader}>
              <View className={styles.tableCell}>类别</View>
              <View className={styles.tableCell}>名称</View>
              <View className={styles.tableCell}>数量</View>
              <View className={styles.tableCell}>单位</View>
            </View>
            {claim.resources.map((res, index) => (
              <View key={index} className={styles.tableRow}>
                <View className={styles.tableCell}>{res.type}</View>
                <View className={styles.tableCell}>{res.name}</View>
                <View className={styles.tableCell}>{res.count}</View>
                <View className={styles.tableCell}>{res.unit}</View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>附件资料</Text>
        <View className={styles.attachmentList}>
          {claim.attachments.map((att) => (
            <View
              key={att.id}
              className={styles.attachmentItem}
              onClick={() => handlePreviewAttachment(att.name)}
            >
              <View className={styles.attachmentIcon}>
                {att.type === 'image' ? '🖼️' : att.type === 'pdf' ? '📄' : '📝'}
              </View>
              <View className={styles.attachmentInfo}>
                <Text className={styles.attachmentName}>{att.name}</Text>
                {att.size && <Text className={styles.attachmentSize}>{att.size}</Text>}
              </View>
              <Text className={styles.infoValue} style={{ flex: 'none' }}>›</Text>
            </View>
          ))}
        </View>
        {claim.attachmentSummary && (
          <View className={styles.attachmentSummary}>
            附件摘要：{claim.attachmentSummary}
          </View>
        )}
      </View>

      {auditRecord && (
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>审核记录</Text>
          <View className={styles.auditRecordContent}>
            <View className={styles.auditResultRow}>
              <View className={classnames(
                styles.resultTag,
                styles[auditRecord.result]
              )}>
                {auditRecord.result === 'true' ? '属实' : auditRecord.result === 'partial' ? '部分属实' : '不属实'}
              </View>
              <Text className={styles.auditorText}>
                {auditRecord.auditor}（{auditRecord.auditorRole}）
              </Text>
            </View>
            <Text className={styles.auditScope}>{auditRecord.approvedScope}</Text>
            {auditRecord.remark && (
              <Text className={styles.auditRemark}>备注：{auditRecord.remark}</Text>
            )}
            <Text className={styles.auditTime}>{auditRecord.auditTime}</Text>
          </View>
        </View>
      )}

      {!isAudited && (
        <View className={styles.bottomBar}>
          <View
            className={classnames(styles.btn, styles.secondary)}
            onClick={() => Taro.navigateBack()}
          >
            返回
          </View>
          <View
            className={classnames(styles.btn, styles.primary)}
            onClick={handleStartAudit}
          >
            开始核验
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default DetailPage
