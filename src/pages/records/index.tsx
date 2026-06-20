import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import FilterPanel from '@/components/FilterPanel'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { AuditRecord, VerifyResult, FilterParams } from '@/types/claim'

const resultMap: Record<VerifyResult, string> = {
  true: '属实',
  partial: '部分属实',
  false: '不属实'
}

const RecordsPage: React.FC = () => {
  const auditRecords = useClaimStore((state) => state.auditRecords)
  const claims = useClaimStore((state) => state.claims)
  const filterOptions = useClaimStore((state) => state.filterOptions)
  const filterAuditRecords = useClaimStore((state) => state.filterAuditRecords)

  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState<FilterParams>({
    projectName: 'all',
    contractor: 'all',
    reasonCategory: 'all',
    result: 'all'
  })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useDidShow(() => {
    console.log('[Records] 页面显示，记录数:', auditRecords.length)
  })

  const filteredRecords = useMemo(() => {
    return filterAuditRecords(filter)
  }, [filter, auditRecords, claims, filterAuditRecords])

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

  const activeFilterTexts = getActiveFilterTexts()

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

      <View className={styles.toolbar}>
        <View
          className={classnames(styles.filterBtn, activeFilterCount > 0 && styles.active)}
          onClick={() => setShowFilter(true)}
        >
          <Text>筛选</Text>
          {activeFilterCount > 0 && (
            <View className={styles.filterCount}>{activeFilterCount}</View>
          )}
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
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const claim = getClaimByAuditRecord(record)
            const isExpanded = expandedIds.has(record.id)

            return (
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

                <View
                  className={classnames(styles.detailSection, isExpanded && styles.expanded)}
                >
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
                        <Text className={styles.scopeLabel}>备注说明</Text>
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
                  <Text className={styles.auditorInfo}>{record.auditorRole}</Text>
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
                  <Text className={classnames(styles.arrow, isExpanded && styles.expanded)}>
                    ▼
                  </Text>
                </View>
              </View>
            )
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无符合条件的审核记录</Text>
          </View>
        )}
      </View>

      <FilterPanel
        visible={showFilter}
        options={filterOptions}
        currentFilter={filter}
        onConfirm={handleFilterConfirm}
        onCancel={() => setShowFilter(false)}
      />
    </ScrollView>
  )
}

export default RecordsPage
