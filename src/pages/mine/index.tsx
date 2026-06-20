import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useClaimStore } from '@/store/useClaimStore'

const MinePage: React.FC = () => {
  const user = useClaimStore((state) => state.user)
  const resetStore = useClaimStore((state) => state.resetStore)

  const handleMenuClick = (key: string) => {
    console.log('[Mine] 点击菜单项:', key)
    switch (key) {
      case 'statistics':
        Taro.showToast({
          title: '统计功能开发中',
          icon: 'none'
        })
        break
      case 'settings':
        Taro.showToast({
          title: '设置功能开发中',
          icon: 'none'
        })
        break
      case 'about':
        Taro.showToast({
          title: '关于功能开发中',
          icon: 'none'
        })
        break
      case 'help':
        Taro.showToast({
          title: '帮助功能开发中',
          icon: 'none'
        })
        break
      case 'feedback':
        Taro.showToast({
          title: '反馈功能开发中',
          icon: 'none'
        })
        break
      case 'reset':
        Taro.showModal({
          title: '重置数据',
          content: '确定要重置所有数据吗？重置后将恢复初始演示数据。',
          success: (res) => {
            if (res.confirm) {
              resetStore()
              Taro.showToast({
                title: '数据已重置',
                icon: 'success'
              })
            }
          }
        })
        break
      default:
        break
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>👤</View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userRole}>{user.roleName}</Text>
            <Text className={styles.userCompany}>{user.company}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>我的审核</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.stats.pending}</Text>
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.stats.approved}</Text>
            <Text className={styles.statLabel}>已审核</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user.stats.total}</Text>
            <Text className={styles.statLabel}>累计</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>功能菜单</Text>

      <View className={styles.menuGroup}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('statistics')}>
          <View className={styles.menuIcon}>📊</View>
          <Text className={styles.menuText}>数据统计</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('help')}>
          <View className={styles.menuIcon}>📖</View>
          <Text className={styles.menuText}>使用帮助</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('feedback')}>
          <View className={styles.menuIcon}>💬</View>
          <Text className={styles.menuText}>意见反馈</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuGroup}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('settings')}>
          <View className={styles.menuIcon}>⚙️</View>
          <Text className={styles.menuText}>设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('about')}>
          <View className={styles.menuIcon}>ℹ️</View>
          <Text className={styles.menuText}>关于</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('reset')}>
          <View className={styles.menuIcon}>🔄</View>
          <Text className={styles.menuText}>重置演示数据</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.versionInfo}>
        停窝工索赔审核 v1.0.0
      </View>
    </View>
  )
}

export default MinePage
