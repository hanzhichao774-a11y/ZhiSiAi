import { create } from 'zustand'
import Taro from '@tarojs/taro'

export interface Question {
  id: string
  content: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
  knowledgePoints: string[]
  errorReason?: string
  compareStatus?: 'progress' | 'still_weak' | 'stable' | 'regression' | 'new'
}

export interface AnalysisResult {
  id: string
  questions: Question[]
  totalQuestions: number
  correctCount: number
  wrongCount: number
  strengths: string[]
  weaknesses: string[]
  errorPatterns: string[]
  imageUrl?: string
}

export interface TutorSession {
  id: string
  analysisId: string
  currentIndex: number
  questions: Question[]
  startTime: number
  feedbacks: Record<string, { understood: boolean; rating?: number }>
}

interface AppState {
  isLoggedIn: boolean
  user: { id: string; nickname: string; avatar?: string } | null
  currentAnalysis: AnalysisResult | null
  currentSession: TutorSession | null
  recentSessions: Array<{ id: string; date: string; wrongCount: number; masteredCount: number }>

  setLoggedIn: (user: any, token: string) => void
  setAnalysis: (analysis: AnalysisResult) => void
  setSession: (session: TutorSession) => void
  updateSessionIndex: (index: number) => void
  addFeedback: (questionId: string, feedback: { understood: boolean; rating?: number }) => void
  addRecentSession: (session: { id: string; date: string; wrongCount: number; masteredCount: number }) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  user: null,
  currentAnalysis: null,
  currentSession: null,
  recentSessions: [],

  setLoggedIn: (user, token) => {
    try { Taro.setStorageSync('token', token) } catch {}
    set({ isLoggedIn: true, user })
  },

  setAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  setSession: (session) => set({ currentSession: session }),

  updateSessionIndex: (index) =>
    set((state) => ({
      currentSession: state.currentSession ? { ...state.currentSession, currentIndex: index } : null,
    })),

  addFeedback: (questionId, feedback) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, feedbacks: { ...state.currentSession.feedbacks, [questionId]: feedback } }
        : null,
    })),

  addRecentSession: (session) =>
    set((state) => ({
      recentSessions: [session, ...state.recentSessions].slice(0, 10),
    })),

  logout: () => {
    try { Taro.removeStorageSync('token') } catch {}
    set({ isLoggedIn: false, user: null })
  },
}))
