import { View, Text, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef } from 'react'
import { useAppStore, Question } from '../../store'
import './index.scss'

function RadarChart({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  return (
    <View className='radar-placeholder'>
      <View className='radar-visual'>
        {['加减混合', '几何面积', '分数运算', '整数乘法', '应用题'].map((label, i) => {
          const isStrong = strengths.some((s) => label.includes(s.substring(0, 2)))
          return (
            <View key={i} className='radar-item'>
              <View className={`radar-bar ${isStrong ? 'strong' : 'weak'}`} style={{ height: isStrong ? '70%' : '30%' }} />
              <Text className='radar-label'>{label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default function ReportPage() {
  const analysis = useAppStore((s) => s.currentAnalysis)
  const setSession = useAppStore((s) => s.setSession)

  if (!analysis) {
    return (
      <View className='report-page'>
        <Text>暂无分析数据</Text>
      </View>
    )
  }

  const wrongQuestions = analysis.questions.filter((q) => !q.isCorrect)
  const progressQuestions = analysis.questions.filter((q) => q.compareStatus === 'progress')
  const regressionQuestions = analysis.questions.filter((q) => q.compareStatus === 'regression')
  const stillWeakQuestions = analysis.questions.filter((q) => q.compareStatus === 'still_weak')
  const hasHistory = analysis.questions.some((q) => q.compareStatus !== 'new')

  const startTutor = () => {
    const questionsToTutor = analysis.questions.filter(
      (q) => !q.isCorrect || q.compareStatus === 'progress'
    )
    const session = {
      id: 'session_' + Date.now(),
      analysisId: analysis.id,
      currentIndex: 0,
      questions: questionsToTutor,
      startTime: Date.now(),
      feedbacks: {},
    }
    setSession(session)
    Taro.navigateTo({ url: '/pages/tutor/index' })
  }

  return (
    <View className='report-page'>
      <View className='overview-card'>
        <Text className='card-title'>📋 整体表现概览</Text>
        <View className='stats-row'>
          <View className='stat-item'>
            <Text className='stat-num'>{analysis.totalQuestions}</Text>
            <Text className='stat-label'>总题数</Text>
          </View>
          <View className='stat-item correct'>
            <Text className='stat-num'>{analysis.correctCount}</Text>
            <Text className='stat-label'>正确</Text>
          </View>
          <View className='stat-item wrong'>
            <Text className='stat-num'>{analysis.wrongCount}</Text>
            <Text className='stat-label'>错题</Text>
          </View>
        </View>
        <Text className='overview-note'>
          建议重点关注基础概念与计算步骤的规范性。
        </Text>
      </View>

      {hasHistory && progressQuestions.length > 0 && (
        <View className='compare-card progress'>
          <Text className='compare-title'>🎉 进步发现</Text>
          <Text className='compare-desc'>以下题型之前做错，这次做对了，建议验证孩子是否真正理解</Text>
          {progressQuestions.map((q) => (
            <View key={q.id} className='compare-item'>
              <Text className='compare-badge'>↑ 进步</Text>
              <Text className='compare-kp'>{q.knowledgePoints.join('、')}</Text>
            </View>
          ))}
        </View>
      )}

      {hasHistory && regressionQuestions.length > 0 && (
        <View className='compare-card regression'>
          <Text className='compare-title'>⚠️ 退步预警</Text>
          <Text className='compare-desc'>以下题型之前做对，这次做错了，可能存在知识遗忘</Text>
          {regressionQuestions.map((q) => (
            <View key={q.id} className='compare-item'>
              <Text className='compare-badge'>↓ 退步</Text>
              <Text className='compare-kp'>{q.knowledgePoints.join('、')}</Text>
            </View>
          ))}
        </View>
      )}

      <View className='section-card'>
        <Text className='card-title'>📊 知识点掌握情况</Text>
        <RadarChart strengths={analysis.strengths} weaknesses={analysis.weaknesses} />
        <View className='kp-list'>
          <View className='kp-group'>
            <Text className='kp-group-label'>● 强项：</Text>
            <Text className='kp-group-value'>{analysis.strengths.join('、')}</Text>
          </View>
          <View className='kp-group weak'>
            <Text className='kp-group-label'>● 弱项：</Text>
            <Text className='kp-group-value'>{analysis.weaknesses.join('、')}</Text>
          </View>
        </View>
      </View>

      <View className='section-card'>
        <Text className='card-title'>🔍 典型错误归因</Text>
        {analysis.errorPatterns.map((p, i) => (
          <View key={i} className='error-pattern'>
            <Text className='pattern-bullet'>●</Text>
            <Text className='pattern-text'>{p}</Text>
          </View>
        ))}
      </View>

      <View className='action-buttons'>
        <View className='action-btn secondary' onClick={() => Taro.navigateBack()}>
          <Text>查看全部错题详情</Text>
        </View>
        <View className='action-btn primary' onClick={startTutor}>
          <Text>开始AI引导辅导</Text>
        </View>
      </View>
    </View>
  )
}
