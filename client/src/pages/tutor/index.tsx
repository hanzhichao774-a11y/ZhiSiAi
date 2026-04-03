import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useAppStore, Question } from '../../store'
import { tutorApi } from '../../services/api'
import './index.scss'

interface GuideContent {
  steps: string[]
  mode: 'correct' | 'verify'
}

const mockGuides: Record<string, GuideContent> = {
  correct: {
    mode: 'correct',
    steps: [
      '先告诉妈妈，这道题最后是想让我们求什么呀？',
      '题目里告诉我们哪些关于数量的条件了？',
      '你第一步是怎么想的？为什么会想到用这个方法呢？',
      '如果我们把条件重新读一遍，你觉得哪一步可以改一下？',
    ],
  },
  verify: {
    mode: 'verify',
    steps: [
      '这道题你上次做错了，这次做对了，真棒！能告诉妈妈你这次是怎么想的吗？',
      '你觉得这道题的关键步骤是什么？为什么上次会做错呢？',
      '如果把题目里的数字换一换，你还能做对吗？试试看怎么想？',
    ],
  },
}

export default function TutorPage() {
  const session = useAppStore((s) => s.currentSession)
  const updateSessionIndex = useAppStore((s) => s.updateSessionIndex)
  const addFeedback = useAppStore((s) => s.addFeedback)
  const [guide, setGuide] = useState<GuideContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [childExplanation, setChildExplanation] = useState('')
  const [verifyResult, setVerifyResult] = useState<{ mastered: boolean; reason: string } | null>(null)
  const [simplified, setSimplified] = useState(false)

  if (!session || session.questions.length === 0) {
    return (
      <View className='tutor-page'>
        <Text>暂无辅导数据</Text>
      </View>
    )
  }

  const currentQ = session.questions[session.currentIndex]
  const isVerifyMode = currentQ.compareStatus === 'progress'
  const total = session.questions.length
  const current = session.currentIndex + 1

  useEffect(() => {
    loadGuide()
  }, [session.currentIndex])

  const loadGuide = async () => {
    setLoading(true)
    setVerifyResult(null)
    setChildExplanation('')
    setSimplified(false)
    try {
      const result = await tutorApi.getGuide({
        questionId: currentQ.id,
        mode: isVerifyMode ? 'verify' : 'correct',
        sessionId: session.id,
      })
      setGuide(result)
    } catch {
      setGuide(isVerifyMode ? mockGuides.verify : mockGuides.correct)
    } finally {
      setLoading(false)
    }
  }

  const handleSimplify = async () => {
    setLoading(true)
    try {
      const result = await tutorApi.simplify({
        questionId: currentQ.id,
        sessionId: session.id,
      })
      setGuide(result)
    } catch {
      setGuide({
        mode: 'correct',
        steps: [
          '宝贝，我们一起来读一遍题目好不好？',
          '题目里说了几个数字？我们一个一个找出来。',
          '第一个数字是什么？好，第二个呢？',
          '现在妈妈问你，这两个数字应该是加在一起还是减掉呢？',
        ],
      })
    } finally {
      setSimplified(true)
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!childExplanation.trim()) {
      Taro.showToast({ title: '请先记录孩子的解题思路', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const result = await tutorApi.verify({
        questionId: currentQ.id,
        sessionId: session.id,
        childExplanation,
      })
      setVerifyResult(result)
    } catch {
      const hasMastered = childExplanation.length > 10
      setVerifyResult({
        mastered: hasMastered,
        reason: hasMastered
          ? '孩子能清晰表达解题思路，说明已理解该知识点的核心逻辑。'
          : '孩子的表述较为模糊，建议通过额外练习加深理解。',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnderstood = () => {
    addFeedback(currentQ.id, { understood: true })
    goNext()
  }

  const goNext = () => {
    if (session.currentIndex < session.questions.length - 1) {
      updateSessionIndex(session.currentIndex + 1)
    } else {
      Taro.navigateTo({ url: '/pages/feedback/index' })
    }
  }

  return (
    <View className='tutor-page'>
      <View className='progress-bar'>
        <View className='progress-fill' style={{ width: `${(current / total) * 100}%` }} />
      </View>
      <Text className='progress-text'>
        当前进度：第 {current} 题 / 共 {total} 题
        {currentQ.knowledgePoints.length > 0 && ` | 知识点：${currentQ.knowledgePoints.join('、')}`}
      </Text>

      {isVerifyMode && (
        <View className='mode-badge verify'>
          <Text>✅ 进步验证</Text>
        </View>
      )}

      {currentQ.compareStatus === 'still_weak' && (
        <View className='mode-badge weak'>
          <Text>⚠️ 这类题型孩子已多次出错，建议放慢节奏重点讲解</Text>
        </View>
      )}

      <View className='question-card'>
        <Text className='q-label'>题目</Text>
        <Text className='q-content'>{currentQ.content}</Text>
        <View className='answer-row'>
          <View className='answer-item wrong'>
            <Text className='a-label'>{isVerifyMode ? '上次错误答案' : '错误答案'}</Text>
            <Text className='a-value'>{isVerifyMode ? currentQ.studentAnswer : currentQ.studentAnswer}</Text>
          </View>
          <View className='answer-item right'>
            <Text className='a-label'>{isVerifyMode ? '本次正确答案' : '正确思路'}</Text>
            <Text className='a-value'>{currentQ.correctAnswer}</Text>
          </View>
        </View>
      </View>

      {!isVerifyMode ? (
        <>
          <View className='guide-card'>
            <Text className='guide-title'>💡 苏格拉底式引导话术（家长请逐句念出）</Text>
            {loading ? (
              <Text className='guide-loading'>AI 正在生成引导话术...</Text>
            ) : (
              guide?.steps.map((step, i) => (
                <View key={i} className='guide-step'>
                  <Text className='step-num'>{i + 1}.</Text>
                  <Text className='step-text'>{step}</Text>
                </View>
              ))
            )}
          </View>

          <View className='action-row'>
            <View className='action-btn success' onClick={handleUnderstood}>
              <Text>孩子听懂了</Text>
            </View>
            <View className='action-btn warn' onClick={handleSimplify}>
              <Text>{simplified ? '再简单一点' : '没听懂，换简单版'}</Text>
            </View>
            <View className='action-btn default' onClick={goNext}>
              <Text>继续下一题</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <View className='guide-card verify'>
            <Text className='guide-title'>🎯 进步验证引导话术</Text>
            {loading ? (
              <Text className='guide-loading'>AI 正在生成验证话术...</Text>
            ) : (
              guide?.steps.map((step, i) => (
                <View key={i} className='guide-step'>
                  <Text className='step-num'>{i + 1}.</Text>
                  <Text className='step-text'>{step}</Text>
                </View>
              ))
            )}
          </View>

          <View className='verify-section'>
            <Text className='verify-label'>📝 记录孩子的解题思路</Text>
            <Textarea
              className='verify-input'
              placeholder='请记录孩子口述的解题过程，例如：他说先用5减2得到3，然后再加3得到6...'
              value={childExplanation}
              onInput={(e) => setChildExplanation(e.detail.value)}
              maxlength={500}
            />
          </View>

          {verifyResult && (
            <View className={`verify-result ${verifyResult.mastered ? 'mastered' : 'not-mastered'}`}>
              <Text className='result-icon'>{verifyResult.mastered ? '🏆' : '📚'}</Text>
              <Text className='result-title'>
                {verifyResult.mastered ? '确认掌握！' : '建议巩固'}
              </Text>
              <Text className='result-reason'>{verifyResult.reason}</Text>
            </View>
          )}

          <View className='action-row'>
            {!verifyResult ? (
              <>
                <View className='action-btn primary' onClick={handleVerify}>
                  <Text>提交验证</Text>
                </View>
                <View className='action-btn default' onClick={goNext}>
                  <Text>跳过，下一题</Text>
                </View>
              </>
            ) : (
              <View className='action-btn primary full' onClick={goNext}>
                <Text>继续下一题</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}
