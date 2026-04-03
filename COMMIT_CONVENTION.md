# Git Commit 规范

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## 格式

```
<type>(<scope>): <subject>

<body>
```

### type (必填)

| 类型       | 说明                                 |
| ---------- | ------------------------------------ |
| `feat`     | 新功能                               |
| `fix`      | Bug 修复                             |
| `docs`     | 文档变更                             |
| `style`    | 代码格式（不影响逻辑）               |
| `refactor` | 重构（非新功能、非 Bug 修复）        |
| `perf`     | 性能优化                             |
| `test`     | 测试相关                             |
| `chore`    | 构建/工具/依赖等辅助变更             |

### scope (推荐填写)

| 范围      | 说明                           |
| --------- | ------------------------------ |
| `client`  | 前端 Taro 项目                 |
| `server`  | 后端 Express 服务              |
| `prompt`  | AI Prompt 模板                 |
| `archive` | 学习档案模块                   |
| `config`  | 项目配置（构建/环境变量等）    |

### subject (必填)

- 用中文简要描述变更内容
- 不超过 50 个字符
- 不加句号

### body (可选)

- 详细说明变更动机或上下文
- 换行后书写

## 示例

```
feat(client): 新增学习档案页知识点趋势图
```

```
fix(server): 修复苏格拉底引导 Prompt JSON 解析异常

当 AI 返回的 JSON 包含 markdown 代码块标记时解析失败，
增加了 strip 逻辑兼容此场景。
```

```
docs: 更新后端 API 接口文档
```

```
chore(config): 升级 Taro 至 4.1.0
```
