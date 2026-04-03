import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAppStore } from '../../store'
import { tutorApi } from '../../services/api'
import './index.scss'

export default function FeedbackPage() {
  const session = useAppStore((s) => s.currentSession)
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!session) {
    return <View className='feedback-page'><Text>暂无辅导数据</Text></View>
  }

  const understood = Object.values(session.feedbacks).filter((f) => f.understood).length
  const total = session.questions.length

  const handleSubmit = async () => {
    if (rating === 0) {
      Taro.showToast({ title: '请为本次辅导打分', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await tutorApi.feedback({
        sessionId: session.id,
        questionId: 'overall',
        understood: true,
        rating,
        note,
      })
    } catch {
      // demo fallback
    }
    Taro.navigateTo({ url: '/pages/complete/index' })
  }

  return (
    <View className='feedback-page'>
      <View className='fb-header'>
        <Text className='fb-icon'>📝</Text>
        <Text className='fb-title'>辅导效果反馈</Text>
        <Text className='fb-desc'>您的反馈将帮助 AI 更精准地为孩子定制辅导方案</Text>
      </View>

      <View className='fb-card'>
        <Text className='card-label'>本次辅导概况</Text>
        <View className='summary-row'>
          <View className='summary-item'>
            <Text className='sum-num'>{total}</Text>
            <Text className='sum-label'>辅导题数</Text>
          </View>
          <View className='summary-item'>
            <Text className='sum-num success'>{understood}</Text>
            <Text className='sum-label'>孩子听懂</Text>
          </View>
          <View className='summary-item'>
            <Text className='sum-num warn'>{total - understood}</Text>
            <Text className='sum-label'>需巩固</Text>
          </View>
        </View>
      </View>

      <View className='fb-card'>
        <Text className='card-label'>整体辅导效果评分</Text>
        <View className='star-row'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              {star <= rating ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
        <Text className='rating-hint'>
          {rating === 0 && '请点击星星评分'}
          {rating === 1 && '不太满意'}
          {rating === 2 && '一般'}
          {rating === 3 && '还不错'}
          {rating === 4 && '比较满意'}
          {rating === 5 && '非常满意'}
        </Text>
      </View>

      <View className='fb-card'>
        <Text className='card-label'>补充备注（选填）</Text>
        <Textarea
          className='note-input'
          placeholder='例如：孩子对几何题特别排斥、今天注意力不太集中...'
          value={note}
          onInput={(e) => setNote(e.detail.value)}
          maxlength={200}
        />
      </View>

      <View className='submit-btn' onClick={handleSubmit}>
        <Text>{submitting ? '提交中...' : '提交反馈，完成辅导'}</Text>
      </View>
    </View>
  )
}
