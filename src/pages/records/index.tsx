import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import FilterPanel from '@/components/FilterPanel'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { AuditRecord, VerifyResult, FilterParams, ReviewResult } from '@/types/claim'

const resultMap: Record<VerifyResult, string> = {
  true: '属实',
  partial: '部分属实',
  false: '不属实'
}

const reviewStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: '待复核', className: 'pending' },
  none: { label: '待复核', className: 'pending' },
  agree: { label: '已归档', className: 'agree' },
  return: { label: '已退回', className: 'return' },
  dispute: { label: '争议中', className: 'dispute' }
}

type ViewMode = 'list' | 'project'

const RecordsPage: React.FC = () => {
  const auditRecords = useClaimStore((state) => state.auditRecords)
  const claims = useClaimStore((state) => state.claims)
  const reviewRecords = useClaimStore((state) => state.reviewRecords)
  const filterOptions = useClaimStore((state) => state.filterOptions)
  const submitReview = useClaimStore((state) => state.submitReview)
  const reviewingRecordIds = useClaimStore((state) => state.reviewingRecordIds)
  const getProjectStats = useClaimStore((state) => state.getProjectStats)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState<FilterParams>({
    projectName: 'all',
    contractor: 'all',
    reasonCategory: 'all',
    result: 'all'
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [reviewDialog, setReviewDialog] = useState<{
    visible: boolean
    auditRecordId: string
    claimId: string
    result: ReviewResult | null
    remark: string
    localSubmitting: boolean
  }>({
    visible: false,
    auditRecordId: '',
    claimId: '',
    result: null,
    remark: '',
    localSubmitting: false
  })

  useDidShow(() => {
    console.log('[Records] 页面显示，记录数:', auditRecords.length)
  })

  const filteredRecords = useMemo(() => {
    let records = [...auditRecords]
    if (filter.projectName && filter.projectName !== 'all') {
      records = records.filter((r) => r.projectName === filter.projectName)
    }
    if (filter.contractor && filter.contractor !== 'all') {
      const claimIds = claims.filter((c) => c.contractor === filter.contractor).map((c) => c.id)
      records = records.filter((r) => claimIds.includes(r.claimId))
    }
    if (filter.reasonCategory && filter.reasonCategory !== 'all') {
      const claimIds = claims.filter((c) => c.reasonCategory === filter.reasonCategory).map((c) => c.id)
      records = records.filter((r) => claimIds.includes(r.claimId))
    }
    if (filter.result && filter.result !== 'all') {
      records = records.filter((r) => r.result === filter.result)
    }
    if (filter.startDate) {
      records = records.filter((r) => r.auditTime >= filter.startDate!)
    }
    if (filter.endDate) {
      records = records.filter((r) => r.auditTime <= filter.endDate! + ' 23:59')
    }
    return records.sort((a, b) => new Date(b.auditTime).getTime() - new Date(a.auditTime).getTime())
  }, [filter, auditRecords, claims])

  const projectStats = useMemo(() => getProjectStats(), [claims, auditRecords])

  const recordsByProject = useMemo(() => {
    const map = new Map<string, AuditRecord[]>()
    filteredRecords.forEach((r) => {
      if (!map.has(r.projectName)) map.set(r.projectName, [])
      map.get(r.projectName)!.push(r)
    })
    return map
  }, [filteredRecords])

  const totalCount = auditRecords.length
  const trueCount = auditRecords.filter((r) => r.result === 'true').length
  const partialCount = auditRecords.filter((r) => r.result === 'partial').length
  const falseCount = auditRecords.filter((r) => r.result === 'false').length

  const activeFilterCount = Object.entries(filter).filter(([k, v]) => {
    if (k === 'startDate' || k === 'endDate') return !!v
    return v && v !== 'all'
  }).length

  const getActiveFilterTexts = () => {
    const texts: string[] = []
    if (filter.projectName && filter.projectName !== 'all') {
      texts.push(filter.projectName.length > 6 ? filter.projectName.slice(0, 6) + '...' : filter.projectName)
    }
    if (filter.contractor && filter.contractor !== 'all') {
      texts.push(filter.contractor.length > 6 ? filter.contractor.slice(0, 6) + '...' : filter.contractor)
    }
    if (filter.reasonCategory && filter.reasonCategory !== 'all') {
      texts.push(filter.reasonCategory)
    }
    if (filter.result && filter.result !== 'all') {
      texts.push(resultMap[filter.result])
    }
    if (filter.startDate || filter.endDate) {
      const dateStr = [filter.startDate, filter.endDate].filter(Boolean).join('~')
      texts.push(dateStr.length > 10 ? dateStr.slice(0, 10) + '...' : dateStr)
    }
    return texts
  }

  const getClaimByAuditRecord = (record: AuditRecord) => {
    return claims.find((c) => c.id === record.claimId)
  }

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  const handleCardClick = (record: AuditRecord) => {
    toggleExpand(record.id)
  }

  const handleViewDetail = (record: AuditRecord) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${record.claimId}&from=records`
    })
  }

  const handleFilterConfirm = (newFilter: FilterParams) => {
    setFilter(newFilter)
    setShowFilter(false)
  }

  const handleClearFilter = () => {
    setFilter({
      projectName: 'all',
      contractor: 'all',
      reasonCategory: 'all',
      result: 'all'
    })
  }

  const handleOpenReview = (record: AuditRecord) => {
    if (record.reviewStatus && record.reviewStatus !== 'pending' && record.reviewStatus !== 'none') {
      Taro.showToast({ title: '该记录已完成复核', icon: 'none' })
      return
    }
    setReviewDialog({
      visible: true,
      auditRecordId: record.id,
      claimId: record.claimId,
      result: null,
      remark: '',
      localSubmitting: false
    })
  }

  const handleReviewResultSelect = (result: ReviewResult) => {
    if (reviewDialog.localSubmitting) return
    setReviewDialog({ ...reviewDialog, result })
  }

  const handleReviewRemarkChange = (e: any) => {
    if (reviewDialog.localSubmitting) return
    setReviewDialog({ ...reviewDialog, remark: e.detail.value })
  }

  const handleSubmitReview = async () => {
    if (reviewDialog.localSubmitting) return
    if (!reviewDialog.result) {
      Taro.showToast({ title: '请选择复核结果', icon: 'none' })
      return
    }
    if (reviewDialog.result === 'return' && !reviewDialog.remark.trim()) {
      Taro.showToast({ title: '退回请填写补充说明', icon: 'none' })
      return
    }
    if (reviewDialog.result === 'dispute' && !reviewDialog.remark.trim()) {
      Taro.showToast({ title: '争议请填写争议原因', icon: 'none' })
      return
    }

    setReviewDialog({ ...reviewDialog, localSubmitting: true })

    try {
      const result = submitReview({
        auditRecordId: reviewDialog.auditRecordId,
        claimId: reviewDialog.claimId,
        result: reviewDialog.result,
        remark: reviewDialog.remark.trim() || undefined
      })

      if (!result) {
        Taro.showToast({ title: '请勿重复提交', icon: 'none' })
        setReviewDialog({ ...reviewDialog, localSubmitting: false })
        return
      }

      setTimeout(() => {
        Taro.showToast({ title: '复核提交成功', icon: 'success' })
        setReviewDialog({ ...reviewDialog, visible: false, localSubmitting: false })
      }, 500)
    } catch (error) {
      console.error('[Records] 复核提交失败:', error)
      setReviewDialog({ ...reviewDialog, localSubmitting: false })
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    }
  }

  const handleCloseReview = () => {
    if (reviewDialog.localSubmitting) return
    setReviewDialog({ ...reviewDialog, visible: false })
  }

  const getReviewByAuditId = (auditRecordId: string) => {
    return reviewRecords.find((r) => r.auditRecordId === auditRecordId)
  }

  const activeFilterTexts = getActiveFilterTexts()
  const reviewDisabled = reviewDialog.localSubmitting || reviewingRecordIds.has(reviewDialog.auditRecordId)

  const renderAuditCard = (record: AuditRecord) => {
    const claim = getClaimByAuditRecord(record)
    const isExpanded = expandedIds.has(record.id)
    const reviewRecord = getReviewByAuditId(record.id)
    const reviewStatusInfo = reviewStatusMap[record.reviewStatus || 'none'] || reviewStatusMap.none
    const canReview = !record.reviewStatus || record.reviewStatus === 'pending' || record.reviewStatus === 'none'

    return (
      <View key={record.id} className={styles.auditCard} onClick={() => handleCardClick(record)}>
        <View className={styles.auditHeader}>
          <Text className={styles.auditCode}>{record.claimCode}</Text>
          <View className={styles.headerTags}>
            <View className={classnames(styles.resultTag, styles[record.result])}>
              {resultMap[record.result]}
            </View>
            {canReview ? (
              <View
                className={classnames(styles.reviewTag, styles[reviewStatusInfo.className])}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenReview(record)
                }}
              >
                业主复核
              </View>
            ) : (
              <View className={classnames(styles.reviewTag, styles[reviewStatusInfo.className])}>
                {reviewStatusInfo.label}
              </View>
            )}
          </View>
        </View>
        <Text className={styles.auditTitle}>{record.approvedScope}</Text>
        <View className={styles.auditInfo}>
          <Text>审核人：{record.auditor}（{record.auditorRole}）</Text>
        </View>

        {claim && (
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              项目：<span>{claim.projectName}</span>
            </View>
            <View className={styles.metaItem}>
              施工单位：<span>{claim.contractor}</span>
            </View>
            <View className={styles.metaItem}>
              原因：<span>{claim.reasonCategory}</span>
            </View>
          </View>
        )}

        {reviewRecord && (
          <View className={styles.reviewInfo}>
            <Text className={styles.reviewLabel}>复核意见：</Text>
            <Text className={styles.reviewText}>
              {reviewRecord.result === 'agree' ? '同意归档' : reviewRecord.result === 'return' ? '退回补充' : '发起争议'}
              {reviewRecord.remark ? ` — ${reviewRecord.remark}` : ''}
            </Text>
            <Text className={styles.reviewTime}>
              {reviewRecord.reviewer}（{reviewRecord.reviewerRole}）{reviewRecord.reviewTime}
            </Text>
          </View>
        )}

        <View className={classnames(styles.detailSection, isExpanded && styles.expanded)}>
          <View className={styles.detailContent}>
            {record.approvedResources.length > 0 && (
              <>
                <Text className={styles.detailSubtitle}>认可的人员机械明细</Text>
                <View className={styles.resourceTable}>
                  <View className={styles.tableHeader}>
                    <View className={styles.tableCell}>类别</View>
                    <View className={styles.tableCell}>名称</View>
                    <View className={styles.tableCell}>数量</View>
                    <View className={styles.tableCell}>单位</View>
                    {record.approvedResources.some((r) => r.duration) && (
                      <View className={styles.tableCell}>时长</View>
                    )}
                  </View>
                  {record.approvedResources.map((res, index) => (
                    <View key={index} className={styles.tableRow}>
                      <View className={styles.tableCell}>{res.type}</View>
                      <View className={styles.tableCell}>{res.name}</View>
                      <View className={styles.tableCell}>{res.count}</View>
                      <View className={styles.tableCell}>{res.unit}</View>
                      {record.approvedResources.some((r) => r.duration) && (
                        <View className={styles.tableCell}>
                          {res.duration ? `${res.duration}${res.durationUnit || '天'}` : '-'}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {record.remark && (
              <View className={styles.scopeBox}>
                <Text className={styles.scopeLabel}>审核备注</Text>
                <Text className={styles.scopeText}>{record.remark}</Text>
              </View>
            )}

            <View
              className={styles.viewDetailBtn}
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetail(record)
              }}
            >
              查看事件详情 →
            </View>
          </View>
        </View>

        <View className={styles.auditFooter}>
          {claim && <StatusTag status={claim.status} />}
          <Text className={styles.auditTime}>{record.auditTime}</Text>
        </View>

        <View
          className={styles.expandBtn}
          onClick={(e) => {
            e.stopPropagation()
            toggleExpand(record.id)
          }}
        >
          {isExpanded ? '收起详情' : '展开明细'}
          <Text className={classnames(styles.arrow, isExpanded && styles.expanded)}>▼</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.statsHeader}>
        <Text className={styles.headerTitle}>已审记录</Text>
        <Text className={styles.headerSubtitle}>历史审核记录查询与复核</Text>
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

      <View className={styles.toolbar}>
        <View className={styles.modeSwitch}>
          <View
            className={classnames(styles.modeBtn, viewMode === 'list' && styles.active)}
            onClick={() => setViewMode('list')}
          >
            列表
          </View>
          <View
            className={classnames(styles.modeBtn, viewMode === 'project' && styles.active)}
            onClick={() => setViewMode('project')}
          >
            按项目
          </View>
        </View>

        <View
          className={classnames(styles.filterBtn, activeFilterCount > 0 && styles.active)}
          onClick={() => setShowFilter(true)}
        >
          <Text>筛选</Text>
          {activeFilterCount > 0 && <View className={styles.filterCount}>{activeFilterCount}</View>}
        </View>

        <View className={styles.activeFilters}>
          {activeFilterTexts.map((text, index) => (
            <View key={index} className={styles.activeFilterTag}>
              {text}
            </View>
          ))}
        </View>

        {activeFilterCount > 0 && (
          <Text className={styles.clearFilter} onClick={handleClearFilter}>
            清除
          </Text>
        )}
      </View>

      <View className={styles.listContainer}>
        {viewMode === 'list' ? (
          filteredRecords.length > 0 ? (
            filteredRecords.map((record) => renderAuditCard(record))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无符合条件的审核记录</Text>
            </View>
          )
        ) : (
          projectStats.length > 0 ? (
            projectStats.map((stats) => {
              const projectRecords = recordsByProject.get(stats.projectName) || []
              const pendingTotal = stats.pendingCount + stats.reviewingCount

              return (
                <View key={stats.projectName} className={styles.projectCard}>
                  <View className={styles.projectHeader}>
                    <Text className={styles.projectName}>{stats.projectName}</Text>
                    <Text className={styles.projectTotal}>共 {stats.totalCount} 条</Text>
                  </View>
                  <View className={styles.projectStats}>
                    <View className={styles.projectStat}>
                      <Text className={styles.projectStatNum}>{pendingTotal}</Text>
                      <Text className={styles.projectStatLabel}>待处理</Text>
                    </View>
                    <View className={styles.projectStatDivider} />
                    <View className={styles.projectStat}>
                      <Text className={styles.projectStatNum} style={{ color: '#14ae5c' }}>
                        {stats.approvedCount}
                      </Text>
                      <Text className={styles.projectStatLabel}>已确认</Text>
                    </View>
                    <View className={styles.projectStatDivider} />
                    <View className={styles.projectStat}>
                      <Text className={styles.projectStatNum} style={{ color: '#f77234' }}>
                        {stats.partialCount}
                      </Text>
                      <Text className={styles.projectStatLabel}>部分认可</Text>
                    </View>
                    <View className={styles.projectStatDivider} />
                    <View className={styles.projectStat}>
                      <Text className={styles.projectStatNum} style={{ color: '#86909c' }}>
                        {stats.rejectedCount}
                      </Text>
                      <Text className={styles.projectStatLabel}>不认可</Text>
                    </View>
                  </View>
                  {stats.reviewingOwnerCount > 0 && (
                    <View className={styles.projectExtraStats}>
                      <Text className={styles.projectExtraStat}>
                        <Text style={{ color: '#f77234' }}>{stats.reviewingOwnerCount}</Text> 业主复核中
                      </Text>
                      {stats.archivedCount > 0 && (
                        <Text className={styles.projectExtraStat}>
                          <Text style={{ color: '#14ae5c' }}>{stats.archivedCount}</Text> 已归档
                        </Text>
                      )}
                      {stats.returnedCount > 0 && (
                        <Text className={styles.projectExtraStat}>
                          <Text style={{ color: '#ff7d00' }}>{stats.returnedCount}</Text> 退回补充
                        </Text>
                      )}
                      {stats.disputedCount > 0 && (
                        <Text className={styles.projectExtraStat}>
                          <Text style={{ color: '#f53f3f' }}>{stats.disputedCount}</Text> 争议中
                        </Text>
                      )}
                    </View>
                  )}
                  {projectRecords.length > 0 && (
                    <View className={styles.projectRecords}>
                      <Text className={styles.projectRecordsTitle}>审核记录（{projectRecords.length}）</Text>
                      {projectRecords.slice(0, 3).map((record) => renderAuditCard(record))}
                      {projectRecords.length > 3 && (
                        <View className={styles.projectMoreBtn}>
                          查看全部 {projectRecords.length} 条 →
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🏗️</Text>
              <Text className={styles.emptyText}>暂无项目数据</Text>
            </View>
          )
        )}
      </View>

      <FilterPanel
        visible={showFilter}
        options={filterOptions}
        currentFilter={filter}
        onConfirm={handleFilterConfirm}
        onCancel={() => setShowFilter(false)}
      />

      {reviewDialog.visible && (
        <View className={styles.confirmDialog}>
          <View className={styles.dialogContent}>
            <Text className={styles.dialogTitle}>业主复核</Text>

            <View className={styles.reviewOptions}>
              <View
                className={classnames(
                  styles.reviewOption,
                  reviewDialog.result === 'agree' && styles.active,
                  styles.agree,
                  reviewDisabled && styles.disabled
                )}
                onClick={() => !reviewDisabled && handleReviewResultSelect('agree')}
              >
                <Text className={styles.optionTitle}>同意归档</Text>
                <Text className={styles.optionDesc}>认可监理审核意见，完成归档</Text>
              </View>
              <View
                className={classnames(
                  styles.reviewOption,
                  reviewDialog.result === 'return' && styles.active,
                  styles.return,
                  reviewDisabled && styles.disabled
                )}
                onClick={() => !reviewDisabled && handleReviewResultSelect('return')}
              >
                <Text className={styles.optionTitle}>退回补充</Text>
                <Text className={styles.optionDesc}>资料不全，退回施工单位补充</Text>
              </View>
              <View
                className={classnames(
                  styles.reviewOption,
                  reviewDialog.result === 'dispute' && styles.active,
                  styles.dispute,
                  reviewDisabled && styles.disabled
                )}
                onClick={() => !reviewDisabled && handleReviewResultSelect('dispute')}
              >
                <Text className={styles.optionTitle}>发起争议</Text>
                <Text className={styles.optionDesc}>存在分歧，需进一步协商或审定</Text>
              </View>
            </View>

            {(reviewDialog.result === 'return' || reviewDialog.result === 'dispute') && (
              <View className={styles.remarkSection}>
                <Text className={styles.remarkLabel}>
                  {reviewDialog.result === 'return' ? '补充说明' : '争议原因'}
                </Text>
                <textarea
                  className={styles.remarkInput}
                  value={reviewDialog.remark}
                  onInput={handleReviewRemarkChange}
                  placeholder={reviewDialog.result === 'return' ? '请说明需要补充的资料' : '请说明争议点和原因'}
                  maxLength={300}
                  disabled={reviewDisabled}
                />
              </View>
            )}

            <View className={styles.dialogBtns}>
              <View
                className={classnames(styles.dialogBtn, styles.secondary, reviewDisabled && styles.disabled)}
                onClick={() => !reviewDisabled && handleCloseReview()}
              >
                取消
              </View>
              <View
                className={classnames(styles.dialogBtn, styles.primary, (!reviewDialog.result || reviewDisabled) && styles.disabled)}
                onClick={handleSubmitReview}
              >
                {reviewDisabled ? '提交中...' : '确认提交'}
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default RecordsPage
