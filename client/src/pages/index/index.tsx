import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'
import './index.scss'

const functionCards = [
  {
    icon: '📷',
    title: '拍照上传作业/试卷',
    desc: '一键扫描，AI快速识别并提供精准解析与批改建议',
    color: '#4F6EF7',
    bgColor: '#EEF1FE',
    path: '/pages/upload/index',
  },
  {
    icon: '📊',
    title: '查看学情报告',
    desc: '多维度分析知识点掌握情况，直观掌握学习短板与进步',
    color: '#22C55E',
    bgColor: '#ECFDF5',
    path: '/pages/study/index',
  },
  {
    icon: '💬',
    title: 'AI辅导对话',
    desc: '实时答疑，提供个性化解题思路与学习方法',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    path: '/pages/upload/index',
  },
  {
    icon: '📒',
    title: '智能错题本',
    desc: '自动归纳错题，生成针对性巩固练习，消灭薄弱环节',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    path: '/pages/study/index',
  },
]

export default function IndexPage() {
  const user = useAppStore((s) => s.user)
  const recentSessions = useAppStore((s) => s.recentSessions)

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  const navigateTo = (path: string) => {
    if (path.includes('study') || path.includes('profile')) {
      Taro.switchTab({ url: path })
    } else {
      Taro.navigateTo({ url: path })
    }
  }

  return (
    <View className='home-page'>
      <View className='home-header'>
        <View className='greeting'>
          <Text className='greeting-title'>欢迎，家长您好 👋</Text>
          <Text className='greeting-sub'>
            今天是{dateStr}，开启智慧辅导之旅
          </Text>
        </View>
      </View>

      <View className='func-grid'>
        {functionCards.map((card, i) => (
          <View
            key={i}
            className='func-card'
            style={{ backgroundColor: card.bgColor }}
            onClick={() => navigateTo(card.path)}
          >
            <View className='func-card-icon' style={{ backgroundColor: card.color }}>
              <Text>{card.icon}</Text>
            </View>
            <Text className='func-card-title'>{card.title}</Text>
            <Text className='func-card-desc'>{card.desc}</Text>
          </View>
        ))}
      </View>

      <View className='recent-section'>
        <Text className='section-title'>最近辅导记录</Text>
        {recentSessions.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📝</Text>
            <Text className='empty-text'>暂无记录，快去体验AI辅导吧！</Text>
          </View>
        ) : (
          recentSessions.map((s) => (
            <View key={s.id} className='session-item'>
              <View className='session-info'>
                <Text className='session-date'>{s.date}</Text>
                <Text className='session-stats'>
                  错题 {s.wrongCount} 道 · 已掌握 {s.masteredCount} 个知识点
                </Text>
              </View>
              <Text className='session-arrow'>›</Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
