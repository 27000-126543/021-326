import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'
import { useClaimStore, syncStatusText } from '@/store/useClaimStore'
import type { SyncStatus, FlowRecord } from '@/types/claim'

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

const actionNames: Record<string, string> = {
  submit: '提交申请',
  sync: '意见同步',
  audit: '现场核验',
  read: '查看记录',
  review: '业主复核'
}

const DetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params.id as string

  const claim = useClaimStore((state) => state.claims.find((c) => c.id === id))
  const auditRecords = useClaimStore((state) =>
    state.auditRecords
      .filter((r) => r.claimId === id)
      .sort((a, b) => new Date(b.auditTime).getTime() - new Date(a.auditTime).getTime())
  )
  const reviewRecords = useClaimStore((state) =>
    state.reviewRecords.filter((r) => r.claimId === id)
  )

  const [highlightedAuditId, setHighlightedAuditId] = useState<string | null>(null)

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
    || claim.status === 'reviewing_owner' || claim.status === 'archived' || claim.status === 'disputed' || claim.status === 'returned'

  const getStatusClass = (status: SyncStatus) => {
    if (status === 'read') return styles.read
    if (status === 'synced') return styles.synced
    return styles.unsynced
  }

  const timeline = useMemo(() => {
    const nodes: Array<FlowRecord & { actionType: string }> = []
    claim.flowRecords.forEach((record) => {
      nodes.push({ ...record, actionType: record.action })
    })
    return nodes.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  }, [claim.flowRecords])

  const getAuditByFlowId = (flowRecordId: string) => {
    return auditRecords.find((r) => r.id === (claim.flowRecords.find((f) => f.id === flowRecordId)?.auditRecordId || ''))
  }

  const getReviewByFlowId = (flowRecordId: string) => {
    const fr = claim.flowRecords.find((f) => f.id === flowRecordId)
    if (!fr?.reviewRecordId) return undefined
    return reviewRecords.find((r) => r.id === fr.reviewRecordId)
  }

  const handleAuditRecordClick = (auditRecordId: string) => {
    if (highlightedAuditId === auditRecordId) {
      setHighlightedAuditId(null)
    } else {
      setHighlightedAuditId(auditRecordId)
    }
  }

  const getHighlightedFlowId = () => {
    if (!highlightedAuditId) return null
    const flow = claim.flowRecords.find((f) => f.auditRecordId === highlightedAuditId)
    return flow?.id || null
  }

  const highlightedFlowId = getHighlightedFlowId()

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
                <Text className={styles.attachmentSize}>
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

      {timeline.length > 0 && (
        <View className={styles.syncSection}>
          <Text className={styles.timelineTitle}>完整时间线</Text>
          <View className={styles.fullTimeline}>
            {timeline.map((record, index) => {
              const isLast = index === timeline.length - 1
              const linkedAudit = record.auditRecordId ? getAuditByFlowId(record.id) : undefined
              const linkedReview = record.reviewRecordId ? getReviewByFlowId(record.id) : undefined
              const isHighlighted = highlightedFlowId === record.id

              return (
                <View key={record.id} className={classnames(styles.timelineNode, styles[record.action], isHighlighted && styles.highlighted)}>
                  <View className={styles.timelineLine}>
                    <View className={styles.timelineDot} />
                    {!isLast && <View className={styles.timelineConnector} />}
                  </View>
                  <View className={styles.timelineContent}>
                    <View className={styles.timelineHeader}>
                      <Text className={styles.timelineAction}>
                        {partyIcons[record.party]} {partyNames[record.party]} · {actionNames[record.action] || record.action}
                      </Text>
                      <Text className={styles.timelineTime}>{record.time}</Text>
                    </View>
                    {linkedAudit && (
                      <View className={styles.timelineDetail}>
                        <View className={styles.inlineResult}>
                          <View className={classnames(styles.inlineTag, styles[linkedAudit.result])}>
                            {linkedAudit.result === 'true' ? '属实' : linkedAudit.result === 'partial' ? '部分属实' : '不属实'}
                          </View>
                          <Text className={styles.inlineScope}>{linkedAudit.approvedScope}</Text>
                        </View>
                        {linkedAudit.approvedResources.length > 0 && (
                          <View className={styles.inlineResources}>
                            {linkedAudit.approvedResources.slice(0, 3).map((res, idx) => (
                              <View key={idx} className={styles.inlineResourceTag}>
                                {res.name} {res.count}{res.unit}
                                {res.duration ? ` × ${res.duration}${res.durationUnit}` : ''}
                              </View>
                            ))}
                            {linkedAudit.approvedResources.length > 3 && (
                              <Text className={styles.inlineMore}>等{linkedAudit.approvedResources.length}项</Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                    {linkedReview && (
                      <View className={styles.timelineDetail}>
                        <View className={styles.inlineResult}>
                          <View
                            className={classnames(
                              styles.inlineTag,
                              linkedReview.result === 'agree' ? styles.true : linkedReview.result === 'return' ? styles.partial : styles.false
                            )}
                          >
                            {linkedReview.result === 'agree' ? '同意归档' : linkedReview.result === 'return' ? '退回补充' : '发起争议'}
                          </View>
                          {linkedReview.remark && (
                            <Text className={styles.inlineScope}>{linkedReview.remark}</Text>
                          )}
                        </View>
                      </View>
                    )}
                    {!linkedAudit && !linkedReview && record.remark && (
                      <Text className={styles.timelineRemark}>{record.remark}</Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}

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
        </View>
      )}

      {auditRecords.length > 0 && (
        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>审核记录（点击可高亮对应时间线节点）</Text>
          {auditRecords.map((record, index) => {
            const isHighlighted = highlightedAuditId === record.id
            const reviewRecord = reviewRecords.find((r) => r.auditRecordId === record.id)
            return (
              <View
                key={record.id}
                className={classnames(styles.auditRecord, isHighlighted && styles.highlighted)}
                style={{ borderTop: index === 0 ? 'none' : '1rpx solid #f2f3f5' }}
                onClick={() => handleAuditRecordClick(record.id)}
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

                {reviewRecord && (
                  <View className={styles.reviewInline}>
                    <Text className={styles.reviewInlineLabel}>业主复核：</Text>
                    <View
                      className={classnames(
                        styles.inlineTag,
                        reviewRecord.result === 'agree' ? styles.true : reviewRecord.result === 'return' ? styles.partial : styles.false
                      )}
                    >
                      {reviewRecord.result === 'agree' ? '同意归档' : reviewRecord.result === 'return' ? '退回补充' : '发起争议'}
                    </View>
                    {reviewRecord.remark && (
                      <Text className={styles.reviewInlineText}>{reviewRecord.remark}</Text>
                    )}
                    <Text className={styles.reviewInlineTime}>
                      {reviewRecord.reviewer} · {reviewRecord.reviewTime}
                    </Text>
                  </View>
                )}

                <Text className={styles.auditTime}>{record.auditTime}</Text>
              </View>
            )
          })}
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
