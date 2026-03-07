# 统一UI管理系统

一个现代化的统一管理界面，用于管理多个部署平台的免费配额，自动停止超限服务。

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn

### 安装依赖
```bash
cd unified-ui
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 访问应用
- 开发服务器：http://localhost:3001
- 默认登录凭据：
  - 用户名：`admin`
  - 密码：`admin`

## 📋 功能特性

### 已实现功能
- ✅ **认证系统** - 用户登录/登出
- ✅ **仪表板** - 总配额使用情况概览
- ✅ **Provider配置管理** - 添加、编辑、测试、删除Provider配置
- ✅ **使用情况监控** - 实时使用数据、告警记录
- ✅ **服务控制** - 停止、启动、重启服务
- ✅ **数据库备份** - 创建、下载、恢复、删除备份
- ✅ **额度规则管理** - 配置警告、严重、停止阈值
- ✅ **SMTP配置** - 邮件服务设置和测试
- ✅ **告警记录** - 查看和过滤告警信息
- ✅ **系统测试** - 一键测试所有功能

### 技术栈
- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **UI库**：TailwindCSS 3.4 + Lucide React
- **状态管理**：React Hooks
- **后端集成**：RESTful API (http://localhost:3000)

### 项目结构
```
unified-ui/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Providers.tsx
│   │   ├── Usage.tsx
│   │   ├── Controls.tsx
│   │   ├── Backup.tsx
│   │   ├── Rules.tsx
│   │   ├── Settings.tsx
│   │   └── Test.tsx
│   ├── App.tsx
│   ├── styles.css
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

### 配置说明
应用会自动连接到后端API（http://localhost:3000），无需额外配置。

### 部署说明
1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态文件服务器
3. 配置服务器代理指向 `/api` 路由到后端服务

### 开发说明
- 所有页面都使用统一的UI设计风格
- 响应式布局，支持移动端和桌面端
- 完整的错误处理和用户反馈
- 实时数据更新和状态同步

### 后端API集成
前端通过以下API端点与后端通信：

- **认证**：`POST /api/auth/login`
- **Provider配置**：`GET/POST/DELETE /api/provider-configs`
- **使用情况**：`GET /api/usage` 和 `GET /api/usage/alerts`
- **服务控制**：`POST /api/service-control/execute` 和 `GET /api/service-controls`
- **数据库备份**：`GET/POST/DELETE /api/backup` 和 `POST /api/backup/restore`
- **额度规则**：`GET/POST/DELETE /api/quota-rules`
- **SMTP配置**：`GET/POST /api/smtp-config` 和 `POST /api/smtp-config/test`
- **系统设置**：`GET/POST /api/smtp-config`
- **健康检查**：`GET /api/health`

### 使用说明
1. 访问 http://localhost:3001
2. 使用默认凭据登录（admin/admin）
3. 在左侧导航栏选择不同功能模块
4. 每个功能都有完整的CRUD操作
5. 所有操作都有确认提示和错误处理

### 注意事项
- 确保后端服务正在运行（http://localhost:3000）
- 使用现代浏览器访问应用
- 支持响应式设计，适配不同屏幕尺寸

## 🎯 优势
- 统一的用户界面，无需切换多个系统
- 现代化的UI设计，提供更好的用户体验
- 完整的功能覆盖，包含所有配额管理功能
- 响应式布局，支持移动端和桌面端
- 实时数据更新和状态同步
- 完善的错误处理和用户反馈