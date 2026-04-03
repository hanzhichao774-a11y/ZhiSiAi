import { Router } from 'express'
import { v4 as uuid } from 'uuid'

export const authRouter = Router()

authRouter.post('/login', (_req, res) => {
  const token = `token_${uuid()}`
  const user = {
    id: `user_${uuid().slice(0, 8)}`,
    nickname: '家长用户',
    avatar: '',
  }
  res.json({ token, user })
})
