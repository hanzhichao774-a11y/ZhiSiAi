import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

const mockArchive = {
  totalSessions: 8,
  totalWrong: 24,
  totalMastered: 18,
  knowledgePoints: [
    { name: '加减法混合运算', score: 85, trend: 'up', sessions: 5 },
    { name: '分数加法运算', score: 92, trend: 'stable', sessions: 3 },
    { name: '几何图形面积', score: 45, trend: 'up', sessions: 6 },
    { name: '整数乘法', score: 90, trend: 'stable', sessions: 2 },
    { name: '三角形面积公式', score: 30, trend: 'down', sessions: 4 },
    { name: '应用题审题', score: 55, trend: 'up', sessions: 5 },
  ],
  suggestion: '建议近期重点加强"几何图形面积"和"三角形面积公式"的练习。孩子在"加减法混合运算"上有明显进步，可以通过变式题巩固。审题能力需要持续关注，建议每次做题前引导孩子先圈出关键词。',
}

const trendIcon = { up: '📈', down: '📉', stable: '➡️' }
const trendLabel = { up: '进步中', down: '需关注', stable: '稳定' }

export default function ArchivePage() {
  const archive = mockArchive
  const sorted = [...archive.knowledgePoints].sort((a, b) => a.score - b.score)

  return (
    <View className='archive-page'>
      <View className='archive-header'>
        <Text className='archive-title'>📘 孩子的学习档案</Text>
        <Text className='archive-desc'>基于历次辅导数据沉淀的个性化成长记录</Text>
      </View>

      <View className='stats-bar'>
        <View className='sbar-item'>
          <Text className='sbar-num'>{archive.totalSessions}</Text>
          <Text className='sbar-label'>总辅导次数</Text>
        </View>
        <View className='sbar-divider' />
        <View className='sbar-item'>
          <Text className='sbar-num'>{archive.totalWrong}</Text>
          <Text className='sbar-label'>累计错题数</Text>
        </View>
        <View className='sbar-divider' />
        <View className='sbar-item'>
          <Text className='sbar-num success'>{archive.totalMastered}</Text>
          <Text className='sbar-label'>已掌握知识点</Text>
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>知识点掌握趋势</Text>
        {archive.knowledgePoints.map((kp, i) => (
          <View key={i} className='kp-row'>
            <View className='kp-info'>
              <Text className='kp-name'>{kp.name}</Text>
              <Text className={`kp-trend ${kp.trend}`}>
                {trendIcon[kp.trend]} {trendLabel[kp.trend]}
              </Text>
            </View>
            <View className='kp-bar-bg'>
              <View
                className={`kp-bar-fill ${kp.score >= 80 ? 'good' : kp.score >= 60 ? 'mid' : 'low'}`}
                style={{ width: `${kp.score}%` }}
              />
            </View>
            <Text className='kp-score'>{kp.score}%</Text>
          </View>
        ))}
      </View>

      <View className='section'>
        <Text className='section-title'>薄弱知识点排行</Text>
        {sorted.slice(0, 3).map((kp, i) => (
          <View key={i} className='weak-item'>
            <Text className='weak-rank'>#{i + 1}</Text>
            <View className='weak-info'>
              <Text className='weak-name'>{kp.name}</Text>
              <Text className='weak-detail'>掌握度 {kp.score}% · 涉及 {kp.sessions} 次辅导</Text>
            </View>
            <Text className={`weak-trend ${kp.trend}`}>{trendIcon[kp.trend]}</Text>
          </View>
        ))}
      </View>

      <View className='section suggestion'>
        <Text className='section-title'>🤖 AI 阶段性学习建议</Text>
        <Text className='suggestion-text'>{archive.suggestion}</Text>
      </View>
    </View>
  )
}
