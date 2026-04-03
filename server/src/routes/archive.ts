import { Router } from 'express'
import { getArchiveStats, updateArchive } from '../services/archive'
import { chatCompletion, stripThinkTags } from '../services/ai'
import { ARCHIVE_SUGGESTION_PROMPT } from '../prompts/report'

export const archiveRouter = Router()

archiveRouter.get('/:childId', (req, res) => {
  const stats = getArchiveStats(req.params.childId)
  if (!stats) {
    return res.json({
      totalSessions: 0,
      totalWrong: 0,
      totalMastered: 0,
      knowledgePoints: [],
      recentSessions: [],
    })
  }
  res.json(stats)
})

archiveRouter.post('/update', (req, res) => {
  try {
    const { childId, sessionId, questions } = req.body
    const archive = updateArchive(childId || 'default_child', {
      sessionId: sessionId || `session_${Date.now()}`,
      questions: questions || [],
    })
    res.json({ success: true, archive })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

archiveRouter.get('/:childId/suggestions', async (req, res) => {
  const stats = getArchiveStats(req.params.childId)
  if (!stats) {
    return res.json({
      suggestion: '暂无足够的学习数据，建议先完成几次辅导来积累数据。',
    })
  }

  try {
    const userPrompt = `孩子的学习档案数据：\n${JSON.stringify(stats, null, 2)}\n\n请基于以上数据生成阶段性学习建议。`
    const raw = await chatCompletion(ARCHIVE_SUGGESTION_PROMPT, userPrompt)
    res.json({ suggestion: stripThinkTags(raw) })
  } catch {
    const weakPoints = stats.knowledgePoints
      .filter((kp) => kp.score < 60)
      .map((kp) => kp.name)

    res.json({
      suggestion: weakPoints.length > 0
        ? `建议近期重点加强${weakPoints.join('、')}的练习。可以通过每天2-3道相关练习题来巩固薄弱知识点。`
        : '孩子整体表现不错，建议保持现有学习节奏，适当增加拓展题目的练习。',
    })
  }
})
