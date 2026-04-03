import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useAppStore } from '../../store'
import { homeworkApi } from '../../services/api'
import './index.scss'

export default function UploadPage() {
  const [imagePath, setImagePath] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const setAnalysis = useAppStore((s) => s.setAnalysis)

  const chooseImage = (sourceType: 'camera' | 'album') => {
    Taro.chooseImage({
      count: 1,
      sourceType: [sourceType],
      success: (res) => {
        setImagePath(res.tempFilePaths[0])
      },
    })
  }

  const handleUpload = async () => {
    if (!imagePath) {
      Taro.showToast({ title: '请先选择图片', icon: 'none' })
      return
    }
    setAnalyzing(true)
    try {
      const result = await homeworkApi.upload(imagePath)
      setAnalysis(result)
      Taro.navigateTo({ url: '/pages/report/index' })
    } catch (e) {
      // Demo fallback: use mock data
      const mockResult = {
        id: 'analysis_' + Date.now(),
        questions: [
          {
            id: 'q1',
            content: '小明有5个苹果，吃掉2个后又买了3个，现在一共有多少个？',
            studentAnswer: '5 - 2 - 3 = 0',
            correctAnswer: '5 - 2 + 3 = 6',
            isCorrect: false,
            knowledgePoints: ['加减法混合运算'],
            errorReason: '审题不清，将"买了"误解为减法',
            compareStatus: 'new' as const,
          },
          {
            id: 'q2',
            content: '一个长方形的长是8cm，宽是5cm，求它的面积。',
            studentAnswer: '8 + 5 = 13',
            correctAnswer: '8 × 5 = 40cm²',
            isCorrect: false,
            knowledgePoints: ['几何图形面积公式'],
            errorReason: '混淆周长与面积的计算方法',
            compareStatus: 'new' as const,
          },
          {
            id: 'q3',
            content: '3/4 + 1/4 = ?',
            studentAnswer: '4/4 = 1',
            correctAnswer: '3/4 + 1/4 = 1',
            isCorrect: true,
            knowledgePoints: ['分数加法'],
            compareStatus: 'new' as const,
          },
          {
            id: 'q4',
            content: '125 × 8 = ?',
            studentAnswer: '1000',
            correctAnswer: '1000',
            isCorrect: true,
            knowledgePoints: ['整数乘法'],
            compareStatus: 'new' as const,
          },
          {
            id: 'q5',
            content: '一个三角形的底是6cm，高是4cm，求面积。',
            studentAnswer: '6 × 4 = 24',
            correctAnswer: '6 × 4 ÷ 2 = 12cm²',
            isCorrect: false,
            knowledgePoints: ['三角形面积公式'],
            errorReason: '忘记除以2',
            compareStatus: 'new' as const,
          },
        ],
        totalQuestions: 5,
        correctCount: 2,
        wrongCount: 3,
        strengths: ['分数的加法运算', '整数乘法'],
        weaknesses: ['几何图形面积公式应用', '加减法混合运算'],
        errorPatterns: ['审题不清（漏看关键词）', '计算粗心（公式记忆不牢）'],
        imageUrl: imagePath,
      }
      setAnalysis(mockResult)
      Taro.navigateTo({ url: '/pages/report/index' })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <View className='upload-page'>
      <View className='upload-area'>
        {imagePath ? (
          <View className='preview-area'>
            <Image className='preview-image' src={imagePath} mode='aspectFit' />
            <View className='re-choose' onClick={() => setImagePath('')}>
              <Text>重新选择</Text>
            </View>
          </View>
        ) : (
          <View className='upload-buttons'>
            <View className='upload-btn camera' onClick={() => chooseImage('camera')}>
              <Text className='btn-icon'>📷</Text>
              <Text className='btn-text'>拍照上传</Text>
            </View>
            <View className='upload-btn album' onClick={() => chooseImage('album')}>
              <Text className='btn-icon'>📂</Text>
              <Text className='btn-text'>从相册选择</Text>
            </View>
          </View>
        )}
      </View>

      <View className='tips'>
        <Text className='tips-icon'>💡</Text>
        <Text className='tips-text'>
          提示：请拍摄整张试卷/作业，保持光线充足，确保内容清晰、完整无遮挡
        </Text>
      </View>

      <View
        className={`submit-btn ${(!imagePath || analyzing) ? 'disabled' : ''}`}
        onClick={handleUpload}
      >
        <Text>{analyzing ? '🔍 AI 正在分析中...' : '确认上传并开始分析'}</Text>
      </View>

      {analyzing && (
        <View className='analyzing-overlay'>
          <View className='analyzing-card'>
            <Text className='analyzing-icon'>🤖</Text>
            <Text className='analyzing-title'>AI 正在分析试卷</Text>
            <Text className='analyzing-desc'>正在识别题目、批改答案、诊断知识点...</Text>
            <View className='progress-bar'>
              <View className='progress-fill' />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
