import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../store'
import './index.scss'

const menuItems = [
  { icon: '📘', label: '学习档案', path: '/pages/archive/index' },
  { icon: '📊', label: '历史学情报告', path: '/pages/study/index' },
  { icon: '🔔', label: '消息通知', path: '' },
  { icon: '⚙️', label: '设置', path: '' },
  { icon: '❓', label: '帮助与反馈', path: '' },
]

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const recentSessions = useAppStore((s) => s.recentSessions)
  const logout = useAppStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    Taro.reLaunch({ url: '/pages/login/index' })
  }

  return (
    <View className='profile-page'>
      <View className='profile-header'>
        <View className='avatar'>
          <Text className='avatar-text'>👤</Text>
        </View>
        <View className='user-info'>
          <Text className='user-name'>{user?.nickname || '家长用户'}</Text>
          <Text className='user-stats'>已辅导 {recentSessions.length} 次</Text>
        </View>
      </View>

      <View className='menu-list'>
        {menuItems.map((item, i) => (
          <View
            key={i}
            className='menu-item'
            onClick={() => item.path && Taro.navigateTo({ url: item.path })}
          >
            <Text className='menu-icon'>{item.icon}</Text>
            <Text className='menu-label'>{item.label}</Text>
            <Text className='menu-arrow'>›</Text>
          </View>
        ))}
      </View>

      <View className='logout-area'>
        <View className='logout-btn' onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>

      <Text className='version'>智思家长AI v1.0.0 Demo</Text>
    </View>
  )
}
