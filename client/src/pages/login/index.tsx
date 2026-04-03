import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAppStore } from '../../store'
import './index.scss'

const features = [
  {
    icon: '📷',
    title: '拍照分析作业试卷',
    desc: '秒批作业，精准识别错题，告别人工检查繁琐',
  },
  {
    icon: '📊',
    title: 'AI 学情深度诊断',
    desc: '多维分析知识薄弱点，一键生成个性化提升方案',
  },
  {
    icon: '💡',
    title: '苏格拉底式引导辅导',
    desc: '启发式提问引导思考，培养孩子自主解决问题能力',
  },
]

export default function LoginPage() {
  const setLoggedIn = useAppStore((s) => s.setLoggedIn)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // Demo: simulate login
      const mockUser = { id: 'demo_user_1', nickname: '家长用户', avatar: '' }
      const mockToken = 'demo_token_' + Date.now()
      setLoggedIn(mockUser, mockToken)
      Taro.switchTab({ url: '/pages/index/index' })
    } catch (e) {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-header'>
        <View className='logo-area'>
          <Text className='logo-icon'>🧒🏻</Text>
          <Text className='logo-text'>智思家长AI</Text>
        </View>
        <Text className='slogan'>AI 赋能家庭教育</Text>
      </View>

      <Swiper className='feature-swiper' indicatorDots autoplay circular interval={3000}>
        {features.map((f, i) => (
          <SwiperItem key={i}>
            <View className='feature-card'>
              <Text className='feature-icon'>{f.icon}</Text>
              <Text className='feature-title'>{f.title}</Text>
              <Text className='feature-desc'>{f.desc}</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      <View className='login-bottom'>
        <View className={`login-btn ${loading ? 'loading' : ''}`} onClick={handleLogin}>
          <Text className='login-btn-icon'>💬</Text>
          <Text className='login-btn-text'>{loading ? '登录中...' : '微信一键登录'}</Text>
        </View>
        <Text className='agreement'>
          登录即代表同意《用户服务协议》和《隐私政策》
        </Text>
      </View>
    </View>
  )
}
