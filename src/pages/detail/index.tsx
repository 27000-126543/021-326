import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'
import { useClaimStore, syncStatusText } from '@/store/useClaimStore'
import type { SyncStatus } from '@/types/claim'

const partyIcons: Record<string, string> = {
  contractor: '🏗️',
  owner: '🏢',
  supervisor: '👷'
}

const partyNames: Record<string, string> = {
  contractor: '施工单位',
  owner: '业主方',
  supervisor: '监理'
}

const DetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id as string
  const getClaimById = useClaimStore((state) => state.getClaimById)
  const getAuditRecordsByClaimId = useClaimStore((state) => state.getAuditRecordsByClaimId)

  const claim = getClaimById(id)
  const auditRecords = getAuditRecordsByClaimId(id)
  const latestRecord = auditRecords[0]

  useDidShow(() => {
    console.log('[Detail] 页面显示，事件ID:', id)
  })

  const handleStartAudit = () => {
    Taro.navigateTo({
      url: `/pages/audit/index?id=${id}`
    })
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
        <Text>事件不存在</Text>
      </View>
    )
  }

  const isAudited = claim.status === 'approved' || claim.status === 'partial' || claim.status === 'rejected'

  const getStatusClass = (status: SyncStatus) => {
    if (status === 'read') return styles.read
    if (status === 'synced') return styles.synced
    return styles.unsynced
  }

  const sortedFlowRecords = [...claim.flowRecords].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  )

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
            <Text className={styles.infoLabel}>所属项目</Text>
            <Text className={styles.infoValue}>{claim.projectName}</Text>
          </View>
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
                <Text className={styles.attachmentSize} style={{ fontSize: '20rpx', color: '#86909c' }}>
                  {att.categoryName}
                </Text>
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

      {isAudited && (
        <View className={styles.syncSection}>
          <Text className={styles.syncTitle}>意见回传状态</Text>
          <View className={styles.syncStatusBar}>
            <View
              className={classnames(styles.syncStatusItem, getStatusClass(claim.syncStatus.contractor))}
            >
              <View className={styles.syncPartyIcon}>🏗️</View>
              <View className={styles.syncPartyInfo}>
                <Text className={styles.syncPartyName}>施工单位</Text>
                <Text className={classnames(styles.syncStatusText, getStatusClass(claim.syncStatus.contractor))}>
                  {syncStatusText[claim.syncStatus.contractor]}
                </Text>
              </View>
            </View>
            <View
              className={classnames(styles.syncStatusItem, getStatusClass(claim.syncStatus.owner))}
            >
              <View className={styles.syncPartyIcon}>🏢</View>
              <View className={styles.syncPartyInfo}>
                <Text className={styles.syncPartyName}>业主方</Text>
                <Text className={classnames(styles.syncStatusText, getStatusClass(claim.syncStatus.owner))}>
                  {syncStatusText[claim.syncStatus.owner]}
                </Text>
              </View>
            </View>
          </View>

          {sortedFlowRecords.length > 0 && (
            <View className={styles.flowRecords}>
              <Text className={styles.flowTitle}>流转记录</Text>
              <View className={styles.flowTimeline}>
                {sortedFlowRecords.map((record) => (
                  <View key={record.id} className={classnames(styles.flowItem, styles[record.action])}>
                    <View className={styles.flowContent}>
                      <View className={styles.flowHeader}>
                        <Text className={styles.flowParty}>
                          {partyIcons[record.party]} {partyNames[record.party]}
                        </Text>
                        <Text className={styles.flowTime}>{record.time}</Text>
                      </View>
                      {record.remark && (
                        <Text className={styles.flowRemark}>{record.remark}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {auditRecords.length > 0 && (
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>审核记录</Text>
          {auditRecords.map((record, index) => (
            <View
              key={record.id}
              className={styles.auditRecord}
              style={{ borderTop: index === 0 ? 'none' : '1rpx solid #f2f3f5' }}
            >
              <View className={styles.auditResultRow}>
                <View className={classnames(styles.resultTag, styles[record.result])}>
                  {record.result === 'true' ? '属实' : record.result === 'partial' ? '部分属实' : '不属实'}
                </View>
                <Text className={styles.auditorText}>
                  {record.auditor}（{record.auditorRole}）
                </Text>
              </View>
              <Text className={styles.auditScope}>{record.approvedScope}</Text>
              {record.remark && (
                <Text className={styles.auditRemark}>备注：{record.remark}</Text>
              )}

              {record.approvedResources.length > 0 && (
                <View style={{ marginTop: '20rpx', marginBottom: '12rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909c', marginBottom: '12rpx' }}>
                    认可明细：
                  </Text>
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
                    {record.approvedResources.map((res, idx) => (
                      <View
                        key={idx}
                        style={{
                          padding: '8rpx 16rpx',
                          background: 'rgba(30, 94, 255, 0.08)',
                          borderRadius: '8rpx',
                          fontSize: '22rpx',
                          color: '#1e5eff'
                        }}
                      >
                        {res.name} {res.count}{res.unit}
                        {res.duration ? ` × ${res.duration}${res.durationUnit}` : ''}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Text className={styles.auditTime}>{record.auditTime}</Text>
            </View>
          ))}
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
