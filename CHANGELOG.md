# Changelog

本文件记录用户可感知的功能变化，仅在版本发布/功能里程碑时更新。

格式遵循 [Keep a Changelog](https://keepachangelog.com/)。

## [0.1.1] - 2026-04-03

### Fixed

- **H5 登录失败**：Zustand store 中 `require('@tarojs/taro')` 动态引入在 H5 打包后变量名丢失（`ReferenceError: _setStorageSync is not defined`），改为顶层 import 解决；同时 `Taro.switchTab` 在 H5 模式下抛异常，改用 `window.location.hash` 导航
- **AI 模型不可用**：原配置的 `MiniMax-Text-01` 不被当前 Token Plan 支持，切换为 `MiniMax-M2.5`
- **AI 响应解析失败**：MiniMax M2 系列模型返回 `<think>...</think>` 推理标签包裹的输出，导致 JSON.parse 失败，新增 `stripThinkTags` / `extractJSON` 工具函数统一预处理

### Changed

- **图像 OCR 接入真实 API**：通过 MiniMax Token Plan 的 `/v1/coding_plan/vlm` 端点替代原先不可用的 OpenAI SDK vision 调用，实现作业图片真实 OCR 识别
- API base URL 从 `api.minimax.chat` 切换为 `api.minimaxi.com`（Token Plan 正确端点）
- H5 开发模式下登录页自动执行 mock 登录，无需手动点击

## [0.1.0] - 2026-04-03

### Added

- 完整 Demo 框架：登录页、首页、拍照上传、学情报告、单题辅导、家长反馈、辅导完成、学习档案、学情中心、我的 共 10 个页面
- 苏格拉底式引导双模式：纠错模式（错题逐步引导）+ 进步验证模式（做对了追问确认理解）
- 学习档案动态更新：每次辅导后自动沉淀数据，生成知识点掌握趋势和薄弱项排行
- 历史对比机制：上传作业时自动对比历史档案，标记四种状态（待验证进步/持续薄弱/稳定掌握/退步预警）
- 后端 AI Prompt 系统：OCR 分析、历史对比、苏格拉底纠错、苏格拉底验证、掌握度评估、学情报告 共 6 套 Prompt
- MiniMax API 接入，支持通过 `.env` 配置切换不同 AI 服务商
- 前端 Taro 4 + React 18 框架，支持 H5 预览和微信小程序编译
- 后端 Express + TypeScript 框架，含完整 RESTful API
