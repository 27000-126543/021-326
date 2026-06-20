import React, { useState, useEffect } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'
import type { VerifyResult, ResourceInfo } from '@/types/claim'

const AuditPage: React.FC = () => {
  const router = useRouter()
  const claimId = router.params.id as string
  const getClaimById = useClaimStore((state) => state.getClaimById)
  const submitAudit = useClaimStore((state) => state.submitAudit)
  const claim = getClaimById(claimId)

  const [result, setResult] = useState<VerifyResult | null>(null)
  const [approvedResources, setApprovedResources] = useState<ResourceInfo[]>([])
  const [approvedScope, setApprovedScope] = useState('')
  const [remark, setRemark] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (claim) {
      console.log('[Audit] 事件信息:', claim.code, claim.title)
      setApprovedResources(
        claim.resources.map((r) => ({
          ...r,
          duration: 1,
          durationUnit: '天'
        }))
      )
    }
  }, [claim])

  const handleResultSelect = (selected: VerifyResult) => {
    setResult(selected)
    if (selected === 'true' && claim) {
      setApprovedResources(
        claim.resources.map((r) => ({
          ...r,
          duration: 1,
          durationUnit: '天'
        }))
      )
      setApprovedScope('全部属实，认可索赔事实')
    } else if (selected === 'false') {
      setApprovedResources([])
      setApprovedScope('不属实，不予认可')
    } else if (selected === 'partial' && claim) {
      setApprovedResources(
        claim.resources.map((r) => ({
          ...r,
          count: Math.ceil(r.count / 2),
          duration: 1,
          durationUnit: '天'
        }))
      )
      setApprovedScope('')
    }
  }

  const handleResourceCountChange = (index: number, delta: number) => {
    const newResources = [...approvedResources]
    const newCount = Math.max(0, newResources[index].count + delta)
    newResources[index] = { ...newResources[index], count: newCount }
    setApprovedResources(newResources)
    updateScopeSummary(newResources)
  }

  const updateScopeSummary = (resources: ResourceInfo[]) => {
    if (result === 'partial') {
      const parts = resources
        .filter((r) => r.count > 0)
        .map((r) => `${r.name}${r.count}${r.unit}`)
      if (parts.length > 0) {
        setApprovedScope(`认可${parts.join('、')}`)
      } else {
        setApprovedScope('')
      }
    }
  }

  const handleScopeChange = (e: any) => {
    setApprovedScope(e.detail.value)
  }

  const handleRemarkChange = (e: any) => {
    setRemark(e.detail.value)
  }

  const handleSubmit = () => {
    if (!result) {
      Taro.showToast({
        title: '请选择核验结果',
        icon: 'none'
      })
      return
    }
    if (result !== 'false' && approvedResources.every((r) => r.count === 0)) {
      Taro.showToast({
        title: '请设置认可数量',
        icon: 'none'
      })
      return
    }
    if (!approvedScope.trim()) {
      Taro.showToast({
        title: '请填写认可范围',
        icon: 'none'
      })
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    if (!claim || !result) return

    setSubmitting(true)
    console.log('[Audit] 提交核验结果:', {
      claimId: claim.id,
      result,
      approvedScope,
      approvedResources,
      remark
    })

    try {
      const newRecord = submitAudit({
        claimId: claim.id,
        result,
        approvedScope,
        approvedResources,
        remark: remark || undefined
      })

      console.log('[Audit] 生成审核记录:', newRecord)

      setTimeout(() => {
        setSubmitting(false)
        setShowConfirm(false)
        Taro.showToast({
          title: '提交成功',
          icon: 'success'
        })
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 })
        }, 1500)
      }, 800)
    } catch (error) {
      console.error('[Audit] 提交失败:', error)
      setSubmitting(false)
      Taro.showToast({
        title: '提交失败',
        icon: 'none'
      })
    }
  }

  const resultText = result === 'true' ? '属实' : result === 'partial' ? '部分属实' : '不属实'

  if (!claim) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.basicInfo}>
        <Text className={styles.basicTitle}>{claim.title}</Text>
        <Text className={styles.basicDesc}>
          {claim.code} · {claim.contractor}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>核验结果</Text>
        <View className={styles.resultOptions}>
          <View
            className={classnames(styles.resultOption, result === 'true' && styles.active, styles.true)}
            onClick={() => handleResultSelect('true')}
          >
            <View className={styles.radioIcon} />
            <View className={styles.optionContent}>
              <Text className={styles.optionTitle}>属实</Text>
              <Text className={styles.optionDesc}>情况全部属实，认可施工单位申报内容</Text>
            </View>
          </View>

          <View
            className={classnames(styles.resultOption, result === 'partial' && styles.active, styles.partial)}
            onClick={() => handleResultSelect('partial')}
          >
            <View className={styles.radioIcon} />
            <View className={styles.optionContent}>
              <Text className={styles.optionTitle}>部分属实</Text>
              <Text className={styles.optionDesc}>部分情况属实，需调整认可数量或范围</Text>
            </View>
          </View>

          <View
            className={classnames(styles.resultOption, result === 'false' && styles.active, styles.false)}
            onClick={() => handleResultSelect('false')}
          >
            <View className={styles.radioIcon} />
            <View className={styles.optionContent}>
              <Text className={styles.optionTitle}>不属实</Text>
              <Text className={styles.optionDesc}>情况不属实，不予认可</Text>
            </View>
          </View>
        </View>
      </View>

      {result && result !== 'false' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>认可数量</Text>
          <View className={styles.resourceSection}>
            {approvedResources.map((res, index) => (
              <View key={index} className={styles.resourceItem}>
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceName}>{res.name}</Text>
                  <Text className={styles.resourceType}>{res.type}</Text>
                </View>
                <View className={styles.resourceControl}>
                  <View
                    className={classnames(
                      styles.controlBtn,
                      res.count <= 0 && styles.disabled
                    )}
                    onClick={() => res.count > 0 && handleResourceCountChange(index, -1)}
                  >
                    -
                  </View>
                  <View className={styles.countInput}>{res.count}</View>
                  <View
                    className={styles.controlBtn}
                    onClick={() => handleResourceCountChange(index, 1)}
                  >
                    +
                  </View>
                  <Text className={styles.unitText}>{res.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {result && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>认可范围</Text>
          <View className={styles.scopeSection}>
            <Textarea
              className={styles.scopeInput}
              value={approvedScope}
              onInput={handleScopeChange}
              placeholder="请描述认可的具体范围，如：只认可2台塔吊停置、钢筋班18人窝工半天"
              maxlength={500}
            />
          </View>
        </View>
      )}

      {result && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注说明</Text>
          <View className={styles.remarkSection}>
            <Textarea
              className={styles.remarkInput}
              value={remark}
              onInput={handleRemarkChange}
              placeholder="可填写补充说明或原因（选填）"
              maxlength={300}
            />
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <Text className={styles.tipsText}>
          核验结果提交后将同步给施工单位和业主方
        </Text>
        <View className={styles.actionRow}>
          <View
            className={classnames(styles.btn, styles.secondary)}
            onClick={() => Taro.navigateBack()}
          >
            取消
          </View>
          <View
            className={classnames(styles.btn, styles.primary, !result && styles.disabled)}
            onClick={handleSubmit}
          >
            提交核验
          </View>
        </View>
      </View>

      {showConfirm && (
        <View className={styles.confirmDialog}>
          <View className={styles.dialogContent}>
            <Text className={styles.dialogTitle}>确认提交</Text>
            <View style={{ textAlign: 'center' }}>
              <View className={classnames(styles.dialogResult, styles[result!])}>
                {resultText}
              </View>
            </View>
            <Text className={styles.dialogText}>
              {approvedScope}
            </Text>
            <Text className={styles.dialogText} style={{ fontSize: '22rpx', color: '#86909c' }}>
              提交后将生成带时间戳的确认记录，施工单位和业主方同步可见
            </Text>
            <View className={styles.dialogBtns}>
              <View
                className={classnames(styles.dialogBtn, styles.secondary)}
                onClick={() => setShowConfirm(false)}
              >
                再想想
              </View>
              <View
                className={classnames(styles.dialogBtn, styles.primary, submitting && styles.disabled)}
                onClick={handleConfirmSubmit}
              >
                {submitting ? '提交中...' : '确认提交'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default AuditPage
