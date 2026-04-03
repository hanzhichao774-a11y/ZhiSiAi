import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'
import './index.scss'

export default function StudyPage() {
  const recentSessions = useAppStore((s) => s.recentSessions)

  return (
    <View className='study-page'>
      <View className='study-header'>
        <Text className='study-title'>学情中心</Text>
        <Text className='study-desc'>查看历次辅导记录与学习趋势</Text>
      </View>

      <View className='quick-actions'>
        <View className='qa-btn' onClick={() => Taro.navigateTo({ url: '/pages/archive/index' })}>
          <Text className='qa-icon'>📘</Text>
          <Text className='qa-text'>学习档案</Text>
        </View>
        <View className='qa-btn' onClick={() => Taro.navigateTo({ url: '/pages/upload/index' })}>
          <Text className='qa-icon'>📷</Text>
          <Text className='qa-text'>新建辅导</Text>
        </View>
      </View>

      <View className='session-list'>
        <Text className='list-title'>历史辅导记录</Text>
        {recentSessions.length === 0 ? (
          <View className='empty'>
            <Text className='empty-icon'>📋</Text>
            <Text className='empty-text'>暂无辅导记录</Text>
            <View className='empty-btn' onClick={() => Taro.navigateTo({ url: '/pages/upload/index' })}>
              <Text>开始第一次辅导</Text>
            </View>
          </View>
        ) : (
          recentSessions.map((s) => (
            <View key={s.id} className='history-item'>
              <View className='h-left'>
                <Text className='h-date'>{s.date}</Text>
                <Text className='h-stats'>错题 {s.wrongCount} 道 · 掌握 {s.masteredCount} 个知识点</Text>
              </View>
              <Text className='h-arrow'>›</Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
