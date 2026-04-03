# 智思家长AI — 前端技术文档

## 技术栈概览

| 技术       | 版本    | 用途                     |
| ---------- | ------- | ------------------------ |
| Taro       | 4.0.9   | 跨端框架（H5 + 微信小程序） |
| React      | 18.3.1  | UI 渲染                  |
| TypeScript | 5.7+    | 类型安全                 |
| Zustand    | 4.5+    | 全局状态管理             |
| Sass       | —       | 样式预处理               |
| Webpack    | 5.91.0  | 构建打包                 |

## 项目结构

```
client/
├── babel.config.js          # Babel 配置（React + TS 预设）
├── config/
│   ├── index.ts             # Taro 主构建配置（含 H5 代理）
│   ├── dev.ts               # 开发环境配置
│   └── prod.ts              # 生产环境配置
├── package.json
├── tsconfig.json            # TypeScript 配置（@/* → ./src/*）
├── types/
│   └── global.d.ts          # 全局类型声明（资源模块 + 环境变量）
└── src/
    ├── app.config.ts         # 页面路由 + TabBar 配置
    ├── app.ts                # 应用入口
    ├── app.scss              # 全局样式（CSS 变量主题）
    ├── index.html            # H5 入口模板
    ├── services/
    │   └── api.ts            # API 请求封装
    ├── store/
    │   └── index.ts          # Zustand 状态管理
    └── pages/                # 10 个页面（详见下方）
        ├── login/
        ├── index/
        ├── upload/
        ├── report/
        ├── tutor/
        ├── feedback/
        ├── complete/
        ├── archive/
        ├── study/
        └── profile/
```

## 开发命令

| 命令                | 说明                             |
| ------------------- | -------------------------------- |
| `npm run dev:h5`    | 启动 H5 开发服务（热更新）       |
| `npm run dev:weapp` | 启动微信小程序编译（watch 模式） |
| `npm run build:h5`  | 构建 H5 生产包                   |
| `npm run build:weapp` | 构建微信小程序生产包           |

H5 开发模式下，`/api` 路径代理到 `http://localhost:3001`（在 `config/index.ts` 中配置）。

## TabBar 配置

| 标签 | 页面路由               | 图标                         |
| ---- | ---------------------- | ---------------------------- |
| 首页 | `pages/index/index`    | `tab-home` / `tab-home-active` |
| 学情 | `pages/study/index`    | `tab-study` / `tab-study-active` |
| 我的 | `pages/profile/index`  | `tab-profile` / `tab-profile-active` |

导航栏默认配置：背景色 `#4F6EF7`，标题 `智思家长AI`，白色文字。

## 页面清单

### 1. 登录页 — `pages/login/index`

- **功能**：模拟微信一键登录，展示产品特色卡片轮播
- **交互**：点击登录按钮 → 写入 demo 用户和 token → `switchTab` 跳转首页
- **API 调用**：无（当前为 mock 登录）

### 2. 首页 — `pages/index/index` [TabBar]

- **功能**：用户问候、四个功能入口卡片、最近辅导记录列表
- **交互**：点击功能卡片导航到对应页面，查看最近辅导历史
- **API 调用**：无（数据来自 Zustand store）
- **导航**：拍照上传 → `upload`，学情相关 → `study`

### 3. 拍照上传页 — `pages/upload/index`

- **功能**：选择相机/相册获取作业图片，上传到后端进行 AI 分析
- **交互**：图片预览、上传按钮、分析中遮罩层
- **API 调用**：`homeworkApi.upload(filePath)` — 失败时使用内置 mock 数据
- **导航**：分析完成 → `report`

### 4. 学情报告页 — `pages/report/index`

- **功能**：展示作业分析结果，包括正确率统计、历史对比、知识点强弱分析、错误模式
- **交互**：历史对比区块（按 `compareStatus` 分组显示进步/退步/薄弱/稳定），构建辅导会话
- **API 调用**：无（数据来自 store 的 `currentAnalysis`）
- **导航**："开始AI引导辅导" → 构建 `TutorSession` 写入 store → `tutor`

### 5. 单题辅导页 — `pages/tutor/index`

- **功能**：逐题进行苏格拉底式引导，支持两种模式
  - **纠错模式**（`correct`）：展示引导步骤，支持"没听懂"简化
  - **验证模式**（`verify`）：针对历史错题现在做对的情况，追问孩子解题思路确认真正掌握
- **交互**：进度条、模式标签、引导步骤展示、验证模式下的文本输入
- **API 调用**：`tutorApi.getGuide`、`tutorApi.simplify`、`tutorApi.verify`（均有 mock fallback）
- **导航**：所有题目完成 → `feedback`

### 6. 家长反馈页 — `pages/feedback/index`

- **功能**：辅导后评分（1-5 星）和文字备注
- **API 调用**：`tutorApi.feedback({ sessionId, questionId, understood, rating, note })`
- **导航**：提交后 → `complete`

### 7. 辅导完成页 — `pages/complete/index`

- **功能**：成功界面，展示辅导时长和统计，模拟"档案已更新"提示
- **交互**：`useEffect` 自动将本次辅导记录推入 `recentSessions`
- **API 调用**：无
- **导航**：返回首页 / 查看学情报告 / 查看学习档案

### 8. 学习档案页 — `pages/archive/index`

- **功能**：展示孩子的学习档案（总次数/错题/掌握统计、知识点趋势、薄弱项排行、AI 建议）
- **API 调用**：无（当前使用硬编码 mock 数据）
- **导航**：无页内导航

### 9. 学情中心 — `pages/study/index` [TabBar]

- **功能**：快捷入口 + 历史辅导记录列表
- **API 调用**：无（数据来自 store）
- **导航**：学习档案 → `archive`，新建辅导 → `upload`

### 10. 我的 — `pages/profile/index` [TabBar]

- **功能**：头像昵称、辅导次数统计、菜单列表、退出登录
- **API 调用**：无
- **导航**：学习档案 → `archive`，历史学情 → `study`，退出登录 → `reLaunch` 到 `login`

## 核心用户流程

```
login ──switchTab──> index [tab]
    │
    ├──> upload ──> report ──> tutor ──> feedback ──> complete
    │                                                    │
    │                            ┌───────────────────────┤
    │                            ↓           ↓           ↓
    │                         index       report      archive
    │
study [tab] ──> archive | upload
profile [tab] ──> archive | study | login (logout)
```

## 核心数据流（Zustand Store）

### 数据类型

```typescript
interface Question {
  id: string
  content: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: boolean
  knowledgePoints: string[]
  errorReason?: string
  compareStatus?: 'progress' | 'still_weak' | 'stable' | 'regression' | 'new'
}

interface AnalysisResult {
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

interface TutorSession {
  id: string
  analysisId: string
  currentIndex: number
  questions: Question[]
  startTime: number
  feedbacks: Record<string, { understood: boolean; rating?: number }>
}
```

### 状态与操作

| 状态               | 类型                   | 说明                      |
| ------------------ | ---------------------- | ------------------------- |
| `isLoggedIn`       | `boolean`              | 登录状态                  |
| `user`             | `{ id, nickname, avatar? } \| null` | 当前用户信息    |
| `currentAnalysis`  | `AnalysisResult \| null` | 当前作业分析结果        |
| `currentSession`   | `TutorSession \| null` | 当前辅导会话              |
| `recentSessions`   | `Array<{...}>`         | 最近辅导记录（最多 10 条）|

| 操作                | 说明                                         |
| ------------------- | -------------------------------------------- |
| `setLoggedIn`       | 设置用户信息和 token                          |
| `setAnalysis`       | 写入作业分析结果                              |
| `setSession`        | 写入辅导会话                                  |
| `updateSessionIndex`| 更新当前辅导题目索引                          |
| `addFeedback`       | 添加单题反馈到会话                            |
| `addRecentSession`  | 追加辅导记录到历史列表                        |
| `logout`            | 清除 token 和用户状态                         |

## API 调用封装（`services/api.ts`）

### 请求基础配置

- H5 环境 `BASE_URL = '/api'`（通过开发代理转发到后端）
- 非 H5 环境 `BASE_URL = 'https://your-server.com/api'`（需替换为实际地址）
- 自动附带 `Authorization: Bearer <token>` 请求头

### 接口清单

| 模块          | 方法              | HTTP 方法 | 路径                       | 说明                   |
| ------------- | ----------------- | --------- | -------------------------- | ---------------------- |
| `authApi`     | `login()`         | POST      | `/auth/login`              | 登录获取 token         |
| `homeworkApi` | `upload(filePath)`| Upload    | `/homework/upload`         | 上传作业图片并分析     |
| `homeworkApi` | `getReport(id)`   | GET       | `/homework/:id/report`     | 获取学情报告           |
| `tutorApi`    | `getGuide(data)`  | POST      | `/tutor/guide`             | 获取苏格拉底引导步骤   |
| `tutorApi`    | `simplify(data)`  | POST      | `/tutor/simplify`          | 简化引导步骤           |
| `tutorApi`    | `verify(data)`    | POST      | `/tutor/verify`            | 验证掌握度             |
| `tutorApi`    | `feedback(data)`  | POST      | `/tutor/feedback`          | 提交反馈               |
| `tutorApi`    | `getSummary(id)`  | GET       | `/tutor/summary/:sessionId`| 获取辅导总结           |
| `archiveApi`  | `get(childId)`    | GET       | `/archive/:childId`        | 获取学习档案           |
| `archiveApi`  | `update(data)`    | POST      | `/archive/update`          | 更新学习档案           |
| `archiveApi`  | `getSuggestions(childId)` | GET | `/archive/:childId/suggestions` | 获取 AI 学习建议 |
