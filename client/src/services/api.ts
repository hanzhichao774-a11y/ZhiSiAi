import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_ENV === 'h5' ? '/api' : 'https://your-server.com/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

async function request<T = any>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token')
  const res = await Taro.request({
    url: `${BASE_URL}${options.url}`,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.header,
    },
  })
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }
  throw new Error(res.data?.message || '请求失败')
}

export const authApi = {
  login: () => request<{ token: string; user: any }>({ url: '/auth/login', method: 'POST' }),
}

export const homeworkApi = {
  upload: (filePath: string) => {
    const token = Taro.getStorageSync('token')
    return new Promise<any>((resolve, reject) => {
      Taro.uploadFile({
        url: `${BASE_URL}/homework/upload`,
        filePath,
        name: 'image',
        header: token ? { Authorization: `Bearer ${token}` } : {},
        success: (res) => {
          try {
            resolve(JSON.parse(res.data))
          } catch {
            resolve(res.data)
          }
        },
        fail: reject,
      })
    })
  },
  getReport: (id: string) => request({ url: `/homework/${id}/report` }),
}

export const tutorApi = {
  getGuide: (data: { questionId: string; mode: 'correct' | 'verify'; sessionId: string }) =>
    request({ url: '/tutor/guide', method: 'POST', data }),
  simplify: (data: { questionId: string; sessionId: string }) =>
    request({ url: '/tutor/simplify', method: 'POST', data }),
  verify: (data: { questionId: string; sessionId: string; childExplanation: string }) =>
    request({ url: '/tutor/verify', method: 'POST', data }),
  feedback: (data: { sessionId: string; questionId: string; understood: boolean; rating?: number; note?: string }) =>
    request({ url: '/tutor/feedback', method: 'POST', data }),
  getSummary: (sessionId: string) => request({ url: `/tutor/summary/${sessionId}` }),
}

export const archiveApi = {
  get: (childId: string) => request({ url: `/archive/${childId}` }),
  update: (data: { childId: string; sessionId: string }) =>
    request({ url: '/archive/update', method: 'POST', data }),
  getSuggestions: (childId: string) => request({ url: `/archive/${childId}/suggestions` }),
}
