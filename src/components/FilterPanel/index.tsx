import React, { useState } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { FilterParams, VerifyResult } from '@/types/claim'

interface FilterPanelProps {
  visible: boolean
  options: {
    projectNames: string[]
    contractors: string[]
    reasonCategories: string[]
    results: { value: string; label: string }[]
  }
  currentFilter: FilterParams
  onConfirm: (filter: FilterParams) => void
  onCancel: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  options,
  currentFilter,
  onConfirm,
  onCancel
}) => {
  const [filter, setFilter] = useState<FilterParams>(currentFilter)

  if (!visible) return null

  const handleSelect = (key: keyof FilterParams, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFilter({
      projectName: 'all',
      contractor: 'all',
      reasonCategory: 'all',
      result: 'all',
      startDate: undefined,
      endDate: undefined
    })
  }

  const handleConfirm = () => {
    onConfirm(filter)
  }

  const getTodayString = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  return (
    <View>
      <View
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={onCancel}
      />
      <View
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000
        }}
      >
        <View className={styles.filterPanel}>
          <View className={styles.panelHeader}>
            <Text className={styles.panelTitle}>筛选条件</Text>
            <Text className={styles.resetBtn} onClick={handleReset}>
              重置
            </Text>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>项目名称</Text>
            <View className={styles.tagList}>
              <View
                className={classnames(styles.tagItem, (!filter.projectName || filter.projectName === 'all') && styles.active)}
                onClick={() => handleSelect('projectName', 'all')}
              >
                全部
              </View>
              {options.projectNames.map((item) => (
                <View
                  key={item}
                  className={classnames(styles.tagItem, filter.projectName === item && styles.active)}
                  onClick={() => handleSelect('projectName', item)}
                >
                  {item}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>施工单位</Text>
            <View className={styles.tagList}>
              <View
                className={classnames(styles.tagItem, (!filter.contractor || filter.contractor === 'all') && styles.active)}
                onClick={() => handleSelect('contractor', 'all')}
              >
                全部
              </View>
              {options.contractors.map((item) => (
                <View
                  key={item}
                  className={classnames(styles.tagItem, filter.contractor === item && styles.active)}
                  onClick={() => handleSelect('contractor', item)}
                >
                  {item}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>停工原因</Text>
            <View className={styles.tagList}>
              <View
                className={classnames(styles.tagItem, (!filter.reasonCategory || filter.reasonCategory === 'all') && styles.active)}
                onClick={() => handleSelect('reasonCategory', 'all')}
              >
                全部
              </View>
              {options.reasonCategories.map((item) => (
                <View
                  key={item}
                  className={classnames(styles.tagItem, filter.reasonCategory === item && styles.active)}
                  onClick={() => handleSelect('reasonCategory', item)}
                >
                  {item}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>审核结论</Text>
            <View className={styles.tagList}>
              {options.results.map((item) => (
                <View
                  key={item.value}
                  className={classnames(styles.tagItem, filter.result === item.value && styles.active)}
                  onClick={() => handleSelect('result', item.value as VerifyResult | 'all')}
                >
                  {item.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterGroup}>
            <Text className={styles.groupLabel}>审核时间</Text>
            <View className={styles.dateRow}>
              <Picker
                mode='date'
                value={filter.startDate || ''}
                end={getTodayString()}
                onChange={(e) => handleSelect('startDate', e.detail.value)}
              >
                <View className={styles.dateInput}>
                  {filter.startDate ? (
                    <Text>{filter.startDate}</Text>
                  ) : (
                    <Text className={styles.datePlaceholder}>开始日期</Text>
                  )}
                </View>
              </Picker>
              <Text className={styles.dateSeparator}>至</Text>
              <Picker
                mode='date'
                value={filter.endDate || ''}
                end={getTodayString()}
                onChange={(e) => handleSelect('endDate', e.detail.value)}
              >
                <View className={styles.dateInput}>
                  {filter.endDate ? (
                    <Text>{filter.endDate}</Text>
                  ) : (
                    <Text className={styles.datePlaceholder}>结束日期</Text>
                  )}
                </View>
              </Picker>
            </View>
          </View>

          <View className={styles.panelFooter}>
            <View
              className={classnames(styles.btn, styles.secondary)}
              onClick={onCancel}
            >
              取消
            </View>
            <View
              className={classnames(styles.btn, styles.primary)}
              onClick={handleConfirm}
            >
              确定
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default FilterPanel
