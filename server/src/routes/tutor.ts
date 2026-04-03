import { Router } from 'express'
import { chatCompletion, extractJSON } from '../services/ai'
import {
  SOCRATIC_CORRECT_SYSTEM_PROMPT,
  SOCRATIC_VERIFY_SYSTEM_PROMPT,
  SOCRATIC_SIMPLIFY_SYSTEM_PROMPT,
  buildSocraticUserPrompt,
  buildVerifyUserPrompt,
} from '../prompts/socratic'
import { MASTERY_EVAL_SYSTEM_PROMPT, buildMasteryEvalPrompt } from '../prompts/verify'

export const tutorRouter = Router()

const sessionStore = new Map<string, any>()

tutorRouter.post('/guide', async (req, res) => {
  try {
    const { questionId, mode, sessionId, question } = req.body
    const systemPrompt = mode === 'verify'
      ? SOCRATIC_VERIFY_SYSTEM_PROMPT
      : SOCRATIC_CORRECT_SYSTEM_PROMPT

    const userPrompt = mode === 'verify'
      ? buildVerifyUserPrompt(question || req.body)
      : buildSocraticUserPrompt(question || req.body)

    try {
      const aiResponse = await chatCompletion(systemPrompt, userPrompt)
      const guide = JSON.parse(extractJSON(aiResponse))
      res.json(guide)
    } catch (err) {
      console.warn('Guide AI failed, using fallback:', (err as Error).message)
      res.json(mode === 'verify'
        ? {
            mode: 'verify',
            steps: [
              '这道题你上次做错了，这次做对了，真棒！能告诉妈妈你这次是怎么想的吗？',
              '你觉得这道题的关键步骤是什么？为什么上次会做错呢？',
              '如果把题目里的数字换一换，你还能做对吗？',
            ],
          }
        : {
            mode: 'correct',
            steps: [
              '先告诉妈妈，这道题最后是想让我们求什么呀？',
              '题目里告诉我们哪些条件了？我们一个一个找出来。',
              '你第一步是怎么想的？为什么会想到用这个方法呢？',
              '如果我们把条件重新读一遍，你觉得哪一步可以改一下？',
            ],
          }
      )
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

tutorRouter.post('/simplify', async (req, res) => {
  try {
    const { questionId, sessionId, question } = req.body
    const userPrompt = buildSocraticUserPrompt(question || req.body)

    try {
      const aiResponse = await chatCompletion(SOCRATIC_SIMPLIFY_SYSTEM_PROMPT, userPrompt)
      res.json(JSON.parse(extractJSON(aiResponse)))
    } catch (err) {
      console.warn('Simplify AI failed, using fallback:', (err as Error).message)
      res.json({
        mode: 'correct',
        steps: [
          '宝贝，我们一起来读一遍题目好不好？',
          '题目里说了几个数字？我们一个一个找出来。',
          '第一个数字是什么？好，第二个呢？',
          '现在妈妈问你，这两个数字应该是加在一起还是减掉呢？',
        ],
      })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

tutorRouter.post('/verify', async (req, res) => {
  try {
    const { questionId, sessionId, childExplanation, question } = req.body
    const userPrompt = buildMasteryEvalPrompt(question || req.body, childExplanation)

    try {
      const aiResponse = await chatCompletion(MASTERY_EVAL_SYSTEM_PROMPT, userPrompt)
      res.json(JSON.parse(extractJSON(aiResponse)))
    } catch (err) {
      console.warn('Verify AI failed, using fallback:', (err as Error).message)
      const hasMastered = childExplanation && childExplanation.length > 15
      res.json({
        mastered: hasMastered,
        reason: hasMastered
          ? '孩子能清晰表达解题思路，说明已理解该知识点的核心逻辑。'
          : '孩子的表述较为模糊，建议通过额外练习加深理解。',
        suggestion: hasMastered ? '' : '建议用类似题型再练习2-3道，巩固理解。',
      })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

tutorRouter.post('/feedback', (req, res) => {
  const { sessionId, questionId, understood, rating, note } = req.body
  const session = sessionStore.get(sessionId) || { feedbacks: {} }
  session.feedbacks[questionId] = { understood, rating, note, timestamp: Date.now() }
  sessionStore.set(sessionId, session)
  res.json({ success: true })
})

tutorRouter.get('/summary/:sessionId', (req, res) => {
  const session = sessionStore.get(req.params.sessionId)
  res.json(session || { feedbacks: {}, message: 'Session not found' })
})
