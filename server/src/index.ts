import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { authRouter } from './routes/auth'
import { homeworkRouter } from './routes/homework'
import { tutorRouter } from './routes/tutor'
import { archiveRouter } from './routes/archive'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRouter)
app.use('/api/homework', homeworkRouter)
app.use('/api/tutor', tutorRouter)
app.use('/api/archive', archiveRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`智思家长AI 后端服务已启动: http://localhost:${PORT}`)
})
