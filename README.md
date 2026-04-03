# 智思家长AI

基于苏格拉底式教学法的 AI 家长辅导助手微信小程序。通过拍照上传作业，AI 自动批改分析，并以引导式对话帮助家长辅导孩子真正理解知识点，而非简单告知答案。

## 核心功能

- **拍照智能批改**：上传作业/试卷照片，AI 自动 OCR 识别并分析对错、归因错误类型
- **苏格拉底式引导**：针对错题生成 3-5 步渐进式提问，引导孩子自主发现错误
- **进步验证机制**：历史错题做对时，追问解题思路确认真正掌握，避免"蒙对"
- **学习档案**：自动沉淀每次辅导数据，跟踪知识点掌握趋势和薄弱项变化
- **历史对比**：每次上传自动与历史档案对比，标记进步/退步/持续薄弱/稳定掌握

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Taro 4 + React 18 + TypeScript + Zustand |
| 后端 | Node.js + Express + TypeScript |
| AI   | OpenAI SDK（兼容 MiniMax / DeepSeek 等） |
| 存储 | 文件系统 JSON（Demo 阶段） |

## 项目结构

```
├── client/          # 前端 Taro 小程序（10 个页面）
├── server/          # 后端 API 服务（6 套 AI Prompt）
├── docs/            # 技术文档
│   ├── frontend.md
│   └── backend.md
├── COMMIT_CONVENTION.md
└── CHANGELOG.md
```

## 快速开始

### 1. 安装依赖

```bash
cd client && npm install
cd ../server && npm install
```

### 2. 配置环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`，填入 AI API Key：

```
AI_API_KEY=your-api-key-here
AI_BASE_URL=https://api.minimax.chat/v1
AI_MODEL=MiniMax-Text-01
AI_VISION_MODEL=MiniMax-Text-01
PORT=3001
```

### 3. 启动服务

```bash
# 启动后端（端口 3001）
cd server && npm run dev

# 启动前端 H5 预览
cd client && npm run dev:h5
```

前端开发服务启动后访问终端提示的地址（默认 `http://localhost:10086`）。

### 4. 微信小程序编译

```bash
cd client && npm run dev:weapp
```

用微信开发者工具打开 `client/dist` 目录即可预览。

## 用户流程

```
登录 → 首页 → 拍照上传 → 学情报告 → 逐题AI辅导 → 家长反馈 → 辅导完成
                                         ↓
                                    学习档案更新
```

## 文档

- [前端技术文档](docs/frontend.md)：页面清单、数据流、API 封装
- [后端技术文档](docs/backend.md)：API 接口、Prompt 系统、数据模型
- [Commit 规范](COMMIT_CONVENTION.md)
- [更新日志](CHANGELOG.md)

## License

MIT
