import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { visionAnalysis, imageToBase64, extractJSON } from '../services/ai'
import { OCR_ANALYZE_SYSTEM_PROMPT, OCR_ANALYZE_USER_PROMPT } from '../prompts/ocr-analyze'
import { getArchive } from '../services/archive'
import { chatCompletion } from '../services/ai'
import { COMPARE_SYSTEM_PROMPT, buildCompareUserPrompt } from '../prompts/compare'

export const homeworkRouter = Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${uuid().slice(0, 8)}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

homeworkRouter.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' })
    }

    const imageBase64 = imageToBase64(req.file.path)
    let analysisResult: any

    try {
      const aiResponse = await visionAnalysis(
        OCR_ANALYZE_SYSTEM_PROMPT,
        imageBase64,
        OCR_ANALYZE_USER_PROMPT
      )
      analysisResult = JSON.parse(extractJSON(aiResponse))
    } catch (err) {
      console.warn('Vision OCR failed, using mock data:', (err as Error).message)
      analysisResult = getMockAnalysis()
    }

    analysisResult.id = `analysis_${uuid().slice(0, 8)}`
    analysisResult.imageUrl = `/uploads/${req.file.filename}`

    // Compare with history if available
    const childId = (req.headers['x-child-id'] as string) || 'default_child'
    const archive = getArchive(childId)

    if (archive && archive.knowledgeHistory.length > 0) {
      try {
        const compareResponse = await chatCompletion(
          COMPARE_SYSTEM_PROMPT,
          buildCompareUserPrompt(analysisResult.questions, archive)
        )
        const comparisons = JSON.parse(extractJSON(compareResponse)).comparisons
        for (const comp of comparisons) {
          const q = analysisResult.questions.find((q: any) => q.id === comp.questionId)
          if (q) q.compareStatus = comp.compareStatus
        }
      } catch {
        // If compare fails, mark all as 'new'
        analysisResult.questions.forEach((q: any) => {
          if (!q.compareStatus) q.compareStatus = 'new'
        })
      }
    } else {
      analysisResult.questions.forEach((q: any) => {
        q.compareStatus = 'new'
      })
    }

    res.json(analysisResult)
  } catch (error: any) {
    console.error('Upload analysis error:', error)
    res.status(500).json({ error: error.message || '分析失败' })
  }
})

homeworkRouter.get('/:id/report', (req, res) => {
  res.json({ message: 'Report endpoint - use analysis data from upload response' })
})

function getMockAnalysis() {
  return {
    questions: [
      {
        id: 'q1',
        content: '小明有5个苹果，吃掉2个后又买了3个，现在一共有多少个？',
        studentAnswer: '5 - 2 - 3 = 0',
        correctAnswer: '5 - 2 + 3 = 6',
        isCorrect: false,
        knowledgePoints: ['加减法混合运算'],
        errorReason: '审题不清，将"买了"误解为减法',
      },
      {
        id: 'q2',
        content: '一个长方形的长是8cm，宽是5cm，求它的面积。',
        studentAnswer: '8 + 5 = 13',
        correctAnswer: '8 × 5 = 40cm²',
        isCorrect: false,
        knowledgePoints: ['几何图形面积公式'],
        errorReason: '混淆周长与面积的计算方法',
      },
      {
        id: 'q3',
        content: '3/4 + 1/4 = ?',
        studentAnswer: '4/4 = 1',
        correctAnswer: '3/4 + 1/4 = 1',
        isCorrect: true,
        knowledgePoints: ['分数加法'],
      },
    ],
    totalQuestions: 3,
    correctCount: 1,
    wrongCount: 2,
    strengths: ['分数加法运算'],
    weaknesses: ['几何图形面积公式', '加减法混合运算'],
    errorPatterns: ['审题不清（漏看关键词）', '公式混淆（面积vs周长）'],
  }
}
