# 智思家长AI — 后端技术文档

## 技术栈概览

| 技术       | 版本    | 用途                         |
| ---------- | ------- | ---------------------------- |
| Node.js    | 18+     | 运行时                       |
| Express    | 4.21    | Web 框架                     |
| TypeScript | 5.7+    | 类型安全                     |
| OpenAI SDK | 4.70+   | AI API 客户端（兼容 MiniMax）|
| Multer     | 1.4.5   | 文件上传处理                 |
| dotenv     | 17.4+   | 环境变量加载                 |
| uuid       | 10.0+   | ID 生成                      |

## 项目结构

```
server/
├── .env                # 环境变量（不提交到 Git）
├── .env.example        # 环境变量示例
├── package.json
├── tsconfig.json       # TS 配置（outDir: ./dist）
├── data/               # 运行时数据目录（存储 archives.json）
├── uploads/            # 上传图片存储目录
└── src/
    ├── index.ts        # 服务入口
    ├── routes/
    │   ├── auth.ts     # 认证路由
    │   ├── homework.ts # 作业上传与分析路由
    │   ├── tutor.ts    # 辅导引导路由
    │   └── archive.ts  # 学习档案路由
    ├── services/
    │   ├── ai.ts       # AI API 封装
    │   └── archive.ts  # 学习档案数据管理
    └── prompts/
        ├── ocr-analyze.ts  # OCR 分析 Prompt
        ├── compare.ts      # 历史对比 Prompt
        ├── socratic.ts     # 苏格拉底引导 Prompt
        ├── verify.ts       # 掌握度评估 Prompt
        └── report.ts       # 学情报告 + 档案建议 Prompt
```

## 启动与部署

### 环境变量配置

复制 `.env.example` 为 `.env`，填入实际值：

| 变量名           | 说明                               | 默认值                           |
| ---------------- | ---------------------------------- | -------------------------------- |
| `AI_API_KEY`     | AI 服务 API Key                    | —（必填）                        |
| `AI_BASE_URL`    | AI 服务地址                        | `https://api.minimax.chat/v1`    |
| `AI_MODEL`       | 文本模型名称                       | `MiniMax-Text-01`                |
| `AI_VISION_MODEL`| 视觉模型名称                       | `MiniMax-Text-01`                |
| `PORT`           | 服务监听端口                       | `3001`                           |

### 启动命令

| 命令            | 说明                              |
| --------------- | --------------------------------- |
| `npm run dev`   | 开发模式（tsx watch，热重启）      |
| `npm run build` | 编译 TypeScript → `dist/`         |
| `npm run start` | 生产模式（运行编译后的 JS）        |

### 服务中间件

- **CORS**：允许所有来源
- **JSON Body Parser**：上限 50MB
- **静态文件**：`/uploads` 路径映射到 `server/uploads/` 目录
- **健康检查**：`GET /api/health` → `{ status: 'ok', timestamp }`

---

## API 接口文档

### 认证模块 — `/api/auth`

#### `POST /api/auth/login`

模拟微信登录，返回固定 demo 用户。

**请求**：Body 无要求

**响应**：
```json
{
  "token": "demo-token-xxx",
  "user": {
    "id": "user_xxx",
    "nickname": "智思家长",
    "avatar": ""
  }
}
```

---

### 作业模块 — `/api/homework`

#### `POST /api/homework/upload`

上传作业图片，AI 进行 OCR 识别和分析。

**请求**：
- Content-Type: `multipart/form-data`
- 字段名: `image`（单文件，最大 10MB）
- 可选 Header: `x-child-id`（指定孩子 ID，用于历史对比）

**响应**：
```json
{
  "id": "analysis_xxxxxxxx",
  "imageUrl": "/uploads/1712100000000-abcdefgh.jpg",
  "questions": [
    {
      "id": "q1",
      "content": "25 + 37 = ?",
      "studentAnswer": "52",
      "correctAnswer": "62",
      "isCorrect": false,
      "knowledgePoints": ["两位数加法", "进位加法"],
      "errorReason": "忘记进位",
      "compareStatus": "still_weak"
    }
  ],
  "totalQuestions": 10,
  "correctCount": 7,
  "wrongCount": 3,
  "strengths": ["乘法口诀", "简单减法"],
  "weaknesses": ["进位加法", "应用题理解"],
  "errorPatterns": ["计算粗心", "进位遗漏"]
}
```

`compareStatus` 取值说明：
- `progress`：历史错过、本次做对（待验证进步）
- `still_weak`：历史错过、本次仍错（持续薄弱）
- `stable`：历史正确、本次仍对（稳定掌握）
- `regression`：历史正确、本次做错（退步预警）
- `new`：无历史记录

**错误处理**：
- `400`：未上传图片 → `{ error: '请上传图片' }`
- `500`：分析失败 → `{ error: '分析失败' }`
- AI 调用失败时自动降级为内置 mock 数据

#### `GET /api/homework/:id/report`

报告端点占位（当前返回提示使用 upload 响应数据）。

---

### 辅导模块 — `/api/tutor`

#### `POST /api/tutor/guide`

获取苏格拉底式引导步骤。

**请求**：
```json
{
  "questionId": "q1",
  "mode": "correct",
  "sessionId": "session_xxx",
  "question": { "content": "...", "studentAnswer": "...", "correctAnswer": "...", "knowledgePoints": [], "errorReason": "..." }
}
```

`mode` 取值：
- `correct`：纠错引导（默认）
- `verify`：进步验证引导

**响应**：
```json
{
  "mode": "correct",
  "steps": [
    "我们来看看这道加法题。25 + 37，你的答案是 52，你是怎么算的呢？",
    "让我们把这道题拆开来看：先算个位 5 + 7 = ？",
    "对！5 + 7 = 12，需要向十位进 1。现在十位是 2 + 3 + 1 = 6，所以答案是 62"
  ]
}
```

AI 失败时返回内置 fallback 步骤。

#### `POST /api/tutor/simplify`

当家长反馈"没听懂"时，生成更简单的引导。

**请求**：同 `/guide`

**响应**：同 `/guide`（步骤更简化）

#### `POST /api/tutor/verify`

评估孩子是否真正掌握了知识点。

**请求**：
```json
{
  "questionId": "q1",
  "sessionId": "session_xxx",
  "childExplanation": "我先算个位5加7等于12，写2进1，然后十位2加3加1等于6",
  "question": { "content": "...", "correctAnswer": "...", "knowledgePoints": [] }
}
```

**响应**：
```json
{
  "mastered": true,
  "reason": "孩子能清晰描述进位加法的计算步骤，说明已理解进位概念",
  "suggestion": "可以用类似的进位加法题目巩固练习"
}
```

AI 失败时基于关键词启发式判断。

#### `POST /api/tutor/feedback`

提交辅导反馈。

**请求**：
```json
{
  "sessionId": "session_xxx",
  "questionId": "q1",
  "understood": true,
  "rating": 5,
  "note": "孩子说明白了"
}
```

**响应**：`{ success: true }`

#### `GET /api/tutor/summary/:sessionId`

获取辅导会话摘要。

**响应**：
```json
{
  "feedbacks": {
    "q1": { "understood": true, "rating": 5, "note": "..." },
    "overall": { "understood": true, "rating": 4 }
  }
}
```

会话不存在时返回空 feedbacks。

---

### 学习档案模块 — `/api/archive`

#### `GET /api/archive/:childId`

获取孩子的学习档案统计。

**响应**（有数据时）：
```json
{
  "totalSessions": 5,
  "totalWrong": 12,
  "totalMastered": 8,
  "knowledgePoints": [
    {
      "name": "进位加法",
      "score": 60,
      "trend": "up",
      "sessions": 3
    }
  ],
  "recentSessions": [
    {
      "id": "session_xxx",
      "date": "2026-04-03T12:00:00.000Z",
      "wrongCount": 3,
      "masteredCount": 2
    }
  ]
}
```

**响应**（无数据时）：
```json
{
  "totalSessions": 0,
  "totalWrong": 0,
  "totalMastered": 0,
  "knowledgePoints": [],
  "recentSessions": []
}
```

#### `POST /api/archive/update`

辅导完成后更新学习档案。

**请求**：
```json
{
  "childId": "default_child",
  "sessionId": "session_xxx",
  "questions": [
    {
      "knowledgePoints": ["进位加法"],
      "isCorrect": false,
      "compareStatus": "still_weak"
    }
  ]
}
```

**响应**：`{ success: true, archive: {...} }`

**错误**：`500` → `{ error: '更新失败' }`

#### `GET /api/archive/:childId/suggestions`

获取 AI 生成的学习建议。

**响应**：
```json
{
  "suggestion": "根据最近的学习情况，建议重点巩固进位加法..."
}
```

AI 失败时返回基于数据的模板建议。

---

## AI Prompt 系统

### 概览

后端使用 6 套 Prompt 模板，统一通过 OpenAI SDK 调用（兼容 MiniMax 等 OpenAI API 兼容服务）。

### Prompt 列表

| 文件                | 用途           | 输入                       | 输出格式     |
| ------------------- | -------------- | -------------------------- | ------------ |
| `ocr-analyze.ts`    | OCR + 批改分析 | 作业图片（base64）         | JSON：题目列表 + 统计 |
| `compare.ts`        | 历史对比       | 当前题目 + 档案数据        | JSON：对比状态列表 |
| `socratic.ts`       | 苏格拉底引导   | 错题信息（3 种子 Prompt）  | JSON：引导步骤 |
| `verify.ts`         | 掌握度评估     | 题目 + 孩子口述解释        | JSON：是否掌握 + 原因 |
| `report.ts`         | 学情报告       | 分析结果 + 历史数据        | JSON：报告结构 |
| `report.ts`（建议） | 档案建议       | 档案统计数据               | 纯文本（150-300 字）|

### 1. OCR 分析 Prompt（`ocr-analyze.ts`）

- **用途**：从作业/试卷图片中识别题目、学生答案、正确答案，判断对错并分析错因
- **输入**：System Prompt + 图片（Vision API）
- **输出 JSON**：
  ```json
  {
    "questions": [{ "id", "content", "studentAnswer", "correctAnswer", "isCorrect", "knowledgePoints", "errorReason?" }],
    "totalQuestions", "correctCount", "wrongCount",
    "strengths", "weaknesses", "errorPatterns"
  }
  ```

### 2. 历史对比 Prompt（`compare.ts`）

- **用途**：将当前分析与历史档案对比，为每道题标记变化状态
- **输入**：当前题目数组 + 档案中的知识点历史
- **输出 JSON**：
  ```json
  {
    "comparisons": [{ "questionId", "compareStatus", "historyNote", "suggestion" }]
  }
  ```

### 3. 苏格拉底引导 Prompt（`socratic.ts`）

提供三种模式的 System Prompt：

| 模式       | 说明                                       | 步骤数 |
| ---------- | ------------------------------------------ | ------ |
| `correct`  | 纠错引导：从问题出发，逐步引导孩子发现错误 | 3-5 步 |
| `verify`   | 验证引导：追问做对的题，确认真正理解       | 2-3 步 |
| `simplify` | 简化引导：用更简单的方式重新解释           | 3-5 步 |

- **输出 JSON**：`{ "steps": [...], "mode": "correct" | "verify" }`

### 4. 掌握度评估 Prompt（`verify.ts`）

- **用途**：根据孩子的口述解释，判断是否真正掌握了知识点
- **输入**：题目信息 + 孩子的解释文本
- **输出 JSON**：`{ "mastered": boolean, "reason": string, "suggestion": string }`

### 5. 学情报告 Prompt（`report.ts`）

- **报告生成**：`{ "summary", "highlights", "concerns", "suggestions", "encouragement" }`
- **档案建议**：纯文本格式，150-300 字，基于档案统计给出阶段性学习建议

---

## 学习档案数据模型

### 存储位置

`server/data/archives.json`（文件系统持久化，首次运行自动创建）

### 数据结构

```typescript
interface KnowledgeRecord {
  name: string                       // 知识点名称
  correctCount: number               // 累计正确次数
  wrongCount: number                 // 累计错误次数
  lastStatus: 'correct' | 'wrong'    // 最近一次状态
  lastUpdated: string                // ISO 时间戳
  history: Array<{                   // 历史记录（最多 20 条）
    date: string
    correct: boolean
  }>
}

interface ChildArchive {
  childId: string
  totalSessions: number              // 累计辅导次数
  totalWrong: number                 // 累计错题数
  totalMastered: number              // 已掌握知识点数
  knowledgeHistory: KnowledgeRecord[]
  sessions: Array<{                  // 辅导记录（最多 50 条，最新在前）
    id: string
    date: string
    wrongCount: number
    masteredCount: number
  }>
  lastUpdated: string
}
```

### 更新逻辑

1. 每次辅导完成后调用 `updateArchive`
2. 遍历本次辅导的所有题目及其知识点
3. 错误题目：对应知识点 `wrongCount++`，`lastStatus = 'wrong'`
4. 正确题目：
   - `compareStatus === 'progress'` 且 `verified === true` → 确认进步
   - 其他正确情况 → `correctCount++`，`lastStatus = 'correct'`
5. 重新计算 `totalMastered`（`correctCount > 0 && lastStatus === 'correct'` 的知识点数）
6. 追加辅导记录到 `sessions`，保存到文件

### 统计输出

`getArchiveStats` 将原始数据转换为前端友好的格式：
- **score**：0-100 分，基于正确/错误比例
- **trend**：`up`（最近正确多于错误）/ `down`（最近错误增多）/ `stable`（无明显变化）
