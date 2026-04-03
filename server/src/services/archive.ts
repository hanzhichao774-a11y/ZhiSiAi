import fs from 'fs'
import path from 'path'

const DB_DIR = path.join(__dirname, '../../data')
const DB_FILE = path.join(DB_DIR, 'archives.json')

interface KnowledgeRecord {
  name: string
  correctCount: number
  wrongCount: number
  lastStatus: 'correct' | 'wrong'
  lastUpdated: string
  history: Array<{ date: string; correct: boolean }>
}

interface ChildArchive {
  childId: string
  totalSessions: number
  totalWrong: number
  totalMastered: number
  knowledgeHistory: KnowledgeRecord[]
  sessions: Array<{
    id: string
    date: string
    wrongCount: number
    masteredCount: number
  }>
  lastUpdated: string
}

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
}

function loadDB(): Record<string, ChildArchive> {
  ensureDir()
  if (!fs.existsSync(DB_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveDB(data: Record<string, ChildArchive>) {
  ensureDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

export function getArchive(childId: string): ChildArchive | null {
  const db = loadDB()
  return db[childId] || null
}

export function updateArchive(
  childId: string,
  sessionData: {
    sessionId: string
    questions: Array<{
      knowledgePoints: string[]
      isCorrect: boolean
      compareStatus?: string
      verified?: boolean
    }>
  }
): ChildArchive {
  const db = loadDB()
  const now = new Date().toISOString()
  const dateStr = new Date().toLocaleDateString('zh-CN')

  let archive = db[childId] || {
    childId,
    totalSessions: 0,
    totalWrong: 0,
    totalMastered: 0,
    knowledgeHistory: [],
    sessions: [],
    lastUpdated: now,
  }

  archive.totalSessions += 1
  const wrongCount = sessionData.questions.filter((q) => !q.isCorrect).length
  archive.totalWrong += wrongCount

  for (const q of sessionData.questions) {
    for (const kp of q.knowledgePoints) {
      let record = archive.knowledgeHistory.find((r) => r.name === kp)
      if (!record) {
        record = { name: kp, correctCount: 0, wrongCount: 0, lastStatus: 'wrong', lastUpdated: now, history: [] }
        archive.knowledgeHistory.push(record)
      }

      if (q.isCorrect) {
        if (q.compareStatus === 'progress' && q.verified) {
          record.correctCount += 1
          record.lastStatus = 'correct'
        } else if (q.compareStatus !== 'progress') {
          record.correctCount += 1
          record.lastStatus = 'correct'
        }
      } else {
        record.wrongCount += 1
        record.lastStatus = 'wrong'
      }

      record.lastUpdated = now
      record.history.push({ date: dateStr, correct: q.isCorrect })
      if (record.history.length > 20) record.history = record.history.slice(-20)
    }
  }

  archive.totalMastered = archive.knowledgeHistory.filter(
    (r) => r.correctCount > 0 && r.lastStatus === 'correct'
  ).length

  archive.sessions.unshift({
    id: sessionData.sessionId,
    date: dateStr,
    wrongCount,
    masteredCount: sessionData.questions.filter((q) => q.isCorrect).length,
  })
  if (archive.sessions.length > 50) archive.sessions = archive.sessions.slice(0, 50)

  archive.lastUpdated = now
  db[childId] = archive
  saveDB(db)

  return archive
}

export function getArchiveStats(childId: string) {
  const archive = getArchive(childId)
  if (!archive) return null

  const knowledgePoints = archive.knowledgeHistory.map((kp) => {
    const total = kp.correctCount + kp.wrongCount
    const score = total > 0 ? Math.round((kp.correctCount / total) * 100) : 0
    const recentHistory = kp.history.slice(-5)
    const recentCorrect = recentHistory.filter((h) => h.correct).length
    const olderCorrect = kp.history.slice(-10, -5).filter((h) => h.correct).length
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (recentCorrect > olderCorrect) trend = 'up'
    else if (recentCorrect < olderCorrect) trend = 'down'

    return { name: kp.name, score, trend, sessions: kp.history.length }
  })

  return {
    totalSessions: archive.totalSessions,
    totalWrong: archive.totalWrong,
    totalMastered: archive.totalMastered,
    knowledgePoints,
    recentSessions: archive.sessions.slice(0, 10),
  }
}
