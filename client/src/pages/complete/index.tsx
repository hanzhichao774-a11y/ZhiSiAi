import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { useAppStore } from '../../store'
import './index.scss'

export default function CompletePage() {
  const session = useAppStore((s) => s.currentSession)
  const analysis = useAppStore((s) => s.currentAnalysis)
  const addRecentSession = useAppStore((s) => s.addRecentSession)
  const [archiveUpdated, setArchiveUpdated] = useState(false)

  const duration = session ? Math.round((Date.now() - session.startTime) / 60000) : 0
  const understood = session ? Object.values(session.feedbacks).filter((f) => f.understood).length : 0
  const needReview = session ? session.questions.length - understood : 0

  useEffect(() => {
    const timer = setTimeout(() => setArchiveUpdated(true), 1500)
    if (session) {
      const today = new Date()
      addRecentSession({
        id: session.id,
        date: `${today.getMonth() + 1}月${today.getDate()}日`,
        wrongCount: analysis?.wrongCount || 0,
        masteredCount: understood,
      })
    }
    return () => clearTimeout(timer)
  }, [])

  return (
    <View className='complete-page'>
      <View className='confetti'>🎉</View>
      <Text className='complete-title'>辅导完成！</Text>
      <Text className='complete-sub'>本次错题辅导成果总结</Text>

      <View className='stats-grid'>
        <View className='stat-card'>
          <Text className='stat-icon'>⏱️</Text>
          <Text className='stat-value'>{duration || 1}</Text>
          <Text className='stat-unit'>分钟</Text>
          <Text className='stat-label'>辅导总时长</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-icon'>✅</Text>
          <Text className='stat-value success'>{understood}</Text>
          <Text className='stat-unit'>个</Text>
          <Text className='stat-label'>已掌握知识点</Text>
        </View>
        <View className='stat-card'>
          <Text className='stat-icon'>📚</Text>
          <Text className='stat-value warn'>{needReview}</Text>
          <Text className='stat-unit'>个</Text>
          <Text className='stat-label'>需重点巩固</Text>
        </View>
      </View>

      <View className={`archive-update ${archiveUpdated ? 'done' : 'loading'}`}>
        <Text className='archive-icon'>{archiveUpdated ? '✅' : '🔄'}</Text>
        <View className='archive-info'>
          <Text className='archive-title'>
            {archiveUpdated ? '学习档案已更新' : '正在更新学习档案...'}
          </Text>
          <Text className='archive-desc'>
            {archiveUpdated
              ? '本次辅导数据已沉淀至孩子的个性化成长档案'
              : '正在将本次学习数据写入档案，优化后续辅导策略'}
          </Text>
        </View>
      </View>

      <View className='action-group'>
        <View className='action-btn primary' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
          <Text>返回首页</Text>
        </View>
        <View className='action-btn secondary' onClick={() => Taro.navigateTo({ url: '/pages/report/index' })}>
          <Text>查看完整学情报告</Text>
        </View>
        <View className='action-btn outline' onClick={() => Taro.navigateTo({ url: '/pages/archive/index' })}>
          <Text>查看学习档案</Text>
        </View>
      </View>
    </View>
  )
}
