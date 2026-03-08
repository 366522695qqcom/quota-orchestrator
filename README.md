# Quota Orchestrator

管理多个部署平台的免费配额，自动停止超限服务。

## 功能特性

- ✅ **多平台支持**：Vercel、Cloudflare、Netlify、Render
- ✅ **数据持久化**：PostgreSQL 数据库存储所有配置和历史数据
- ✅ **Token 加密**：AES-256 加密存储 API Token
- ✅ **额度监控**：实时监控各平台使用量
- ✅ **智能告警**：邮件告警（警告/严重/停止）
- ✅ **自动停止**：达到配额时自动停止服务
- ✅ **定时恢复**：支持定时恢复和手动恢复
- ✅ **双语支持**：中文/英文界面
- ✅ **Docker 部署**：一键部署到云服务器
- ✅ **日志系统**：Winston 结构化日志，支持文件轮转
- ✅ **错误处理**：全局异常过滤器 + 智能重试机制
- ✅ **单元测试**：Jest 测试框架，覆盖率报告
- ✅ **数据可视化**：使用量趋势图表
- ✅ **RBAC 权限**：基于角色的访问控制（ADMIN/USER/VIEWER）
- ✅ **数据库备份**：自动备份和恢复功能
- ✅ **网络分析**：Vercel Analytics 流量分析

## 技术栈

**后端**：
- NestJS 10.x
- Prisma ORM
- PostgreSQL 15
- JWT 认证
- Nodemailer 邮件
- 定时任务调度
- Winston 日志

**前端**：
- React 18.x
- Vite 5.x
- Tailwind CSS 3.x
- TypeScript
- Vercel Analytics

## 快速开始

### 1. 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下必需的环境变量：

#### 必需环境变量

| 变量名 | 说明 | 示例 |
|---------|------|------|
| DATABASE_URL | PostgreSQL数据库连接字符串 | `postgresql://postgres:postgres@localhost:5432/quota_orchestrator` |
| ADMIN_USERNAME | 管理员用户名 | `admin` |
| ADMIN_PASSWORD | 管理员密码 | `your-secure-password` |
| ENCRYPTION_KEY | AES-256加密密钥（32字符） | `abcdefghijklmnopqrstuvwxyz123456` |
| JWT_SECRET | JWT签名密钥 | `your-jwt-secret-key-here` |

#### 可选环境变量（有默认值）

| 变量名 | 默认值 | 说明 |
|---------|---------|------|
| SESSION_TTL_SECONDS | 43200 (12小时) | 会话过期时间（秒） |
| PORT | 3000 | 后端服务端口 |
| SMTP_HOST | smtp.gmail.com | SMTP服务器地址 |
| SMTP_PORT | 587 | SMTP端口 |
| SMTP_USER | your-email@gmail.com | SMTP用户名 |
| SMTP_PASSWORD | your-app-password | SMTP密码 |
| SMTP_FROM | Quota Orchestrator <noreply@example.com> | 发件人地址 |
| BACKUP_DIR | ./backups | 备份文件目录 |
| LOG_DIR | ./logs | 日志文件目录 |
| LOG_LEVEL | info | 日志级别 |

**详细说明**：查看 [环境变量说明](#环境变量说明) 获取所有环境变量的详细说明。

### 2. Docker 部署（推荐）

#### 步骤1：准备环境
```bash
# 1. 安装 Docker 和 Docker Compose
# Windows: 下载 Docker Desktop
# Linux: sudo apt-get install docker.io docker-compose
# macOS: 下载 Docker Desktop

# 2. 验证安装
docker --version
docker-compose --version
```

#### 步骤2：克隆代码
```bash
git clone <your-repo-url>
cd quota-orchestrator
```

#### 步骤3：配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# Linux/Mac: vim .env 或 nano .env
```

#### 步骤4：启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

**Docker 服务说明**：
- **app**: 后端 API 服务（端口 3000）
- **postgres**: PostgreSQL 数据库（端口 5432）
- **数据卷**：
  - `./data`: 数据库数据持久化
  - `./backups`: 备份文件持久化
  - `./logs`: 日志文件持久化

**Docker 命令**：
- `docker-compose up -d`: 启动所有服务（后台运行）
- `docker-compose ps`: 查看服务状态
- `docker-compose logs -f app`: 查看应用日志
- `docker-compose logs -f postgres`: 查看数据库日志
- `docker-compose down`: 停止所有服务
- `docker-compose down -v`: 停止并删除数据卷
- `docker-compose restart`: 重启所有服务
- `docker-compose restart app`: 重启应用服务

### 3. 本地开发

#### 后端

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

#### 前端

```bash
cd web
npm install
npm run dev
```

## 环境变量说明

### 必需环境变量

#### 1. DATABASE_URL

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quota_orchestrator
```

**说明**：PostgreSQL 数据库连接字符串

**格式**：`postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]`

**示例**：
- 本地：`postgresql://postgres:postgres@localhost:5432/quota_orchestrator`
- Docker：`postgresql://postgres:postgres@postgres:5432/quota_orchestrator`
- 云数据库：`postgresql://user:password@host.rds.amazonaws.com:5432/quota_orchestrator`

#### 2. ADMIN_USERNAME

```env
ADMIN_USERNAME=admin
```

**说明**：管理员用户名，用于登录系统

**默认值**：`admin`

#### 3. ADMIN_PASSWORD

```env
ADMIN_PASSWORD=your-secure-password
```

**说明**：管理员密码，用于登录系统

**安全建议**：
- 使用强密码（至少12个字符）
- 包含大小写字母、数字和特殊字符
- 不要使用默认密码

#### 4. ENCRYPTION_KEY

```env
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
```

**说明**：AES-256 加密密钥，用于加密 API Token

**要求**：必须是32个字符

**生成方法**：
```bash
# 方法1：使用 openssl
openssl rand -hex 32

# 方法2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. JWT_SECRET

```env
JWT_SECRET=your-jwt-secret-key-here
```

**说明**：JWT 签名密钥，用于生成和验证 JWT Token

**安全建议**：
- 使用长随机字符串（至少32个字符）
- 不要与其他密钥相同
- 定期更换

**生成方法**：
```bash
# 方法1：使用 openssl
openssl rand -base64 32

# 方法2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 可选环境变量（有默认值）

#### 1. SESSION_TTL_SECONDS

```env
SESSION_TTL_SECONDS=43200
```

**说明**：会话过期时间（秒）

**默认值**：`43200`（12小时）

**建议值**：
- 开发环境：`86400`（24小时）
- 生产环境：`43200`（12小时）
- 高安全环境：`3600`（1小时）

#### 2. PORT

```env
PORT=3000
```

**说明**：后端服务端口

**默认值**：`3000`

**注意事项**：
- 确保端口未被占用
- 防火墙需要开放该端口

#### 3. SMTP 配置

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Quota Orchestrator <noreply@example.com>
```

**说明**：邮件服务器配置，用于发送告警邮件

**Gmail 配置**：
1. 启用两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `SMTP_PASSWORD`

**其他邮箱**：
- Outlook：`smtp-mail.outlook.com:587`
- Yahoo：`smtp.mail.yahoo.com:587`
- QQ邮箱：`smtp.qq.com:587`

**UI 配置方式**：
- 登录系统后，可以在"设置"页面配置 SMTP
- 支持自定义 SMTP 服务器
- 支持测试邮件发送功能
- 配置会保存在数据库中
- 每个用户可以有独立的 SMTP 配置

**API 端点**：
- `GET /api/smtp-config` - 获取 SMTP 配置
- `PUT /api/smtp-config` - 更新 SMTP 配置
- `DELETE /api/smtp-config` - 删除 SMTP 配置
- `POST /api/smtp-config/test` - 发送测试邮件

**详细说明**：查看 [SMTP 配置说明](#smtp-配置说明) 获取详细的配置方法。

#### 4. BACKUP_DIR

```env
BACKUP_DIR=./backups
```

**说明**：数据库备份文件存储目录

**默认值**：`./backups`

**建议**：
- 使用绝对路径：`/var/backups/quota-orchestrator`
- 确保目录有写权限
- 定期清理旧备份

#### 5. LOG_DIR

```env
LOG_DIR=./logs
```

**说明**：日志文件存储目录

**默认值**：`./logs`

**建议**：
- 使用绝对路径：`/var/log/quota-orchestrator`
- 确保目录有写权限
- 配置日志轮转

#### 6. LOG_LEVEL

```env
LOG_LEVEL=info
```

**说明**：日志级别

**可选值**：
- `error`：只记录错误
- `warn`：记录警告和错误
- `info`：记录信息、警告和错误（默认）
- `debug`：记录所有级别（开发环境）

## 获取 API Token

### Vercel

#### 获取步骤
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击右上角头像 → Settings
3. 滚动到 "Tokens" 部分
4. 点击 "Create Token"
5. 输入 Token 名称和描述
6. 选择 Token 权限：
   - ✅ Full Account
   - ✅ Read
   - ✅ Write
7. 点击 "Create"
8. 复制生成的 Token

#### 使用说明
- **Account ID**：在 Dashboard 的 Settings 中找到
- **API Token**：刚创建的 Token
- **权限要求**：Full Account 权限

#### 注意事项
- ⚠️ Token 只显示一次，请立即复制保存
- ⚠️ 不要分享 Token 给他人
- ⚠️ 定期更换 Token

### Cloudflare

#### 获取步骤
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 点击右上角 "Get your API token"
4. 点击 "Create Token"
5. 输入 Token 名称
6. 选择权限：
   - ✅ Account - Account Settings:Read
   - ✅ Zone - Zone:Read
   - ✅ Worker - Worker Scripts:Edit
7. 点击 "Continue to summary"
8. 复制生成的 Token

#### 使用说明
- **Account ID**：在右侧边栏的账户信息中找到
- **Account Tag**：在账户设置中找到
- **API Token**：刚创建的 Token

#### 注意事项
- ⚠️ Token 只显示一次，请立即复制保存
- ⚠️ 选择最小必要的权限
- ⚠️ 定期更换 Token

### Netlify

#### 获取步骤
1. 登录 [Netlify Dashboard](https://app.netlify.com/)
2. 点击右上角头像 → User settings
3. 滚动到 "Applications" 部分
4. 点击 "New access token"
5. 输入 Token 描述
6. 选择权限：
   - ✅ Full access
7. 点击 "Generate token"
8. 复制生成的 Token

#### 使用说明
- **Account ID**：使用 Netlify 站点名称
- **Account Slug**：在 URL 中找到（如 `https://app.netlify.com/sites/your-slug`）
- **API Token**：刚创建的 Token

#### 注意事项
- ⚠️ Token 只显示一次，请立即复制保存
- ⚠️ 使用最小必要的权限
- ⚠️ 定期更换 Token

### Render

#### 获取步骤
1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 点击右上角头像 → Account Settings
3. 滚动到 "Password & Authentication" 部分
4. 找到 "API Key" 部分
5. 点击 "Generate API Key"
6. 输入描述
7. 点击 "Generate"
8. 复制生成的 API Key

#### 使用说明
- **Account ID**：使用服务名称
- **API Token**：刚创建的 API Key

#### 注意事项
- ⚠️ API Key 只显示一次，请立即复制保存
- ⚠️ 定期更换 API Key
- ⚠️ 不要分享给他人

## 安装步骤

### Docker 部署（推荐）

#### 步骤1：准备环境
```bash
# 1. 安装 Docker 和 Docker Compose
# Windows: 下载 Docker Desktop
# Linux: sudo apt-get install docker.io docker-compose
# macOS: 下载 Docker Desktop

# 2. 验证安装
docker --version
docker-compose --version
```

#### 步骤2：克隆代码
```bash
git clone <your-repo-url>
cd quota-orchestrator
```

#### 步骤3：配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# Linux/Mac: vim .env 或 nano .env
```

#### 步骤4：启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

**Docker 服务说明**：
- **app**: 后端 API 服务（端口 3000）
- **postgres**: PostgreSQL 数据库（端口 5432）
- **数据卷**：
  - `./data`: 数据库数据持久化
  - `./backups`: 备份文件持久化
  - `./logs`: 日志文件持久化

**Docker 命令**：
- `docker-compose up -d`: 启动所有服务（后台运行）
- `docker-compose ps`: 查看服务状态
- `docker-compose logs -f app`: 查看应用日志
- `docker-compose logs -f postgres`: 查看数据库日志
- `docker-compose down`: 停止所有服务
- `docker-compose down -v`: 停止并删除数据卷
- `docker-compose restart`: 重启所有服务
- `docker-compose restart app`: 重启应用服务

### 本地开发

#### 步骤1：准备环境
```bash
# 1. 安装 Node.js
# 下载：https://nodejs.org/
# 验证：node --version

# 2. 安装 PostgreSQL
# Windows: 下载安装程序
# Linux: sudo apt-get install postgresql postgresql-contrib
# macOS: brew install postgresql
```

#### 步骤2：克隆代码
```bash
git clone <your-repo-url>
cd quota-orchestrator
```

#### 步骤3：安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..
```

#### 步骤4：配置数据库
```bash
# 启动 PostgreSQL 服务
# Windows: 在服务管理器中启动
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql

# 创建数据库
createdb quota_orchestrator

# 运行迁移
npm run prisma:migrate
```

#### 步骤5：启动服务
```bash
# 终端1：启动后端
npm run start:dev

# 终端2：启动前端
cd web
npm run dev
```

## 启动服务

### Docker 方式

#### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除卷
docker-compose down -v
```

#### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart app
```

### 本地开发方式

#### 启动后端
```bash
# 开发模式（热重载）
npm run start:dev

# 生产模式
npm run build
npm start
```

#### 启动前端
```bash
# 开发模式（热重载）
cd web
npm run dev

# 构建生产版本
cd web
npm run build
```

## 使用指南

### 1. 登录系统

#### 访问应用
- **前端地址**：http://localhost:5173
- **后端 API**：http://localhost:3000/api

#### 登录步骤
1. 打开浏览器访问 http://localhost:5173
2. 输入用户名（默认：`admin`）
3. 输入密码（在 .env 中配置）
4. 点击"登录"按钮

#### 首次登录后
- 系统会自动创建管理员账户
- 会话有效期为12小时（可配置）
- 过期后需要重新登录

### 2. 添加 Provider 配置

#### 添加步骤
1. 登录系统后，点击"添加"按钮
2. 选择 Provider 类型（Vercel/Cloudflare/Netlify/Render）
3. 输入 Account ID
4. 输入 API Token
5. （可选）输入额外参数
6. 点击"添加"按钮

#### 配置示例
```
Provider: Vercel
Account ID: personal
API Token: vercel_xxxxxxxxxxxxxxxxxxxxxx
```

### 3. 测试 Provider 配置

#### 测试步骤
1. 在左侧配置列表中找到目标 Provider
2. 点击"测试配置"按钮
3. 等待测试完成
4. 查看测试结果（使用量快照）

#### 测试结果
- ✅ 成功：显示使用量快照
- ❌ 失败：显示错误信息

### 4. 配置额度规则

#### 添加规则步骤
1. 选择已添加的 Provider
2. 切换到"额度规则"标签
3. 点击"添加规则"按钮
4. 输入规则信息：
   - 指标名称（如：requests）
   - 配额限制（如：100000）
   - 警告阈值（如：80%）
   - 严重阈值（如：95%）
   - 停止阈值（如：100%）
5. 点击"保存"按钮

#### 默认规则
系统会为每个 Provider 提供默认规则：
- **Vercel**：
  - requests: 100,000/天
  - bandwidth_mb: 102,400/月
  - function_ms: 100,000/月
- **Cloudflare**：
  - workers_requests: 100,000/天
- **Netlify**：
  - build_minutes: 300/月
  - bandwidth_mb: 102,400/月
- **Render**：
  - running_hours: 750/月

### 5. 监控使用量

#### 自动监控
- 系统每 10 分钟自动轮询所有 Provider
- 使用量数据自动保存到数据库
- 达到阈值时自动发送告警
- 超过停止阈值时自动停止服务

#### 手动测试
1. 切换到"概览"标签
2. 点击"测试用量"按钮
3. 查看实时使用量数据
4. 查看使用量趋势图表

### 6. 服务控制

#### 手动控制
1. 切换到"服务控制"标签
2. 选择操作：
   - 停止服务
   - 启动服务
   - 重启服务
3. 点击对应按钮
4. 查看操作结果

#### 定时恢复
1. 切换到"服务控制"标签
2. 点击"定时恢复"按钮
3. 输入恢复时间
4. 点击"确认"按钮
5. 系统会在指定时间自动恢复服务

### 7. 数据库备份

#### 创建备份
1. 切换到"备份"标签
2. 点击"创建备份"按钮
3. 等待备份完成
4. 查看备份列表

#### 下载备份
1. 在备份列表中找到目标备份
2. 点击"下载备份"按钮
3. 备份文件自动下载到本地

#### 恢复备份
1. 在备份列表中找到目标备份
2. 点击"恢复备份"按钮
3. 确认恢复操作
4. 等待恢复完成

#### 删除备份
1. 在备份列表中找到目标备份
2. 点击"删除"按钮
3. 确认删除操作
4. 备份文件被删除

### 8. 查看历史记录

#### 使用量历史
1. 切换到"历史记录"标签
2. 查看历史使用量数据
3. 查看使用量趋势图表

#### 告警记录
1. 切换到"告警记录"标签
2. 查看所有告警历史
3. 查看告警级别和详情

#### 服务控制记录
1. 切换到"服务控制"标签
2. 查看所有控制操作历史
3. 查看操作类型和执行时间

## API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 用户登出

### Provider 配置
- `POST /api/provider-configs` - 创建配置
- `GET /api/provider-configs` - 获取所有配置
- `GET /api/provider-configs/:id` - 获取单个配置
- `PUT /api/provider-configs/:id` - 更新配置
- `DELETE /api/provider-configs/:id` - 删除配置
- `POST /api/provider-configs/:id/quota-rules` - 创建额度规则
- `GET /api/provider-configs/:id/quota-rules` - 获取额度规则
- `PUT /api/provider-configs/quota-rules/:ruleId` - 更新额度规则
- `DELETE /api/provider-configs/quota-rules/:ruleId` - 删除额度规则
- `POST /api/provider-configs/:id/test` - 测试配置
- `POST /api/provider-configs/:id/cancel` - 取消配置

### SMTP 配置
- `GET /api/smtp-config` - 获取 SMTP 配置
- `PUT /api/smtp-config` - 更新 SMTP 配置
- `DELETE /api/smtp-config` - 删除 SMTP 配置
- `POST /api/smtp-config/test` - 发送测试邮件

### 使用量监控
- `POST /api/usage/test` - 测试使用量
- `GET /api/usage/history/:configId` - 获取历史记录
- `GET /api/usage/alerts/:configId` - 获取告警记录
- `GET /api/usage/service-controls/:configId` - 获取服务控制记录

### 服务控制
- `POST /api/service-control/execute` - 执行服务控制（停止/启动/重启）
- `POST /api/service-control/schedule-recovery` - 定时恢复
- `GET /api/service-control/scheduled-recoveries/:configId` - 获取定时恢复
- `DELETE /api/service-control/scheduled-recoveries/:recoveryId` - 取消恢复

### 数据库备份
- `POST /api/backup` - 创建备份（仅管理员）
- `GET /api/backup` - 列出所有备份（仅管理员）
- `GET /api/backup/download/:filename` - 下载备份（仅管理员）
- `DELETE /api/backup/:filename` - 删除备份（仅管理员）
- `POST /api/backup/restore/:filename` - 恢复备份（仅管理员）

## 默认配额规则

系统为每个平台提供了默认的配额规则：

### Vercel 免费版
- 请求数：100,000/天
- 带宽：100GB/月
- 函数执行时间：100,000ms/月

### Cloudflare Workers 免费版
- Worker 请求数：100,000/天

### Netlify 免费版
- 构建时间：300分钟/月
- 带宽：100GB/月

### Render 免费版
- 运行时间：750小时/月

## 定时任务

系统自动执行以下定时任务：

### 每 10 分钟
- 轮询所有配置的账户使用量
- 检查额度规则
- 发送告警邮件
- 执行服务控制操作

### 每小时
- 检查并执行定时恢复任务
- 清理过期会话

## 安全性

### RBAC 权限系统
- ✅ **RBAC 权限系统**：基于角色的访问控制
  - **ADMIN 角色**：完全访问权限
  - **USER 角色**：基本访问权限
  - **VIEWER 角色**：只读权限
  - 使用 `@Roles()` 装饰器保护端点

### 数据库备份
- ✅ **数据库备份**：自动备份和恢复功能
  - 支持 pg_dump 备份
  - 支持备份列表查看
  - 支持备份删除和恢复
  - 仅管理员可执行备份操作

### API Token 加密
- ✅ **API Token 加密**：AES-256 加密存储
  - 使用加密密钥加密敏感信息
  - 数据库中存储加密后的 Token
  - 使用时自动解密

### 密码安全
- ✅ **密码安全**：bcrypt 密码哈希
  - 使用 bcrypt 哈希存储密码
  - 登录时验证哈希值
  - 使用强密码策略

### JWT 会话
- ✅ **JWT 会话**：12小时过期
  - 使用 JWT 签名和验证
  - 会话过期时间可配置
  - 自动清理过期会话

### 输入验证
- ✅ **输入验证**：class-validator 数据验证
  - 所有 API 输入都经过验证
  - 防止无效数据进入系统
  - 提供友好的错误提示

### SQL 注入防护
- ✅ **SQL 注入防护**：Prisma ORM 参数化查询
  - 使用参数化查询
  - 防止 SQL 注入攻击
  - 自动转义特殊字符

### XSS 防护
- ✅ **XSS 防护**：React 转义
  - React 自动转义输出
  - 防止 XSS 攻击
  - 安全的 HTML 渲染

### CORS 配置
- ✅ **CORS 配置**：限制跨域访问
  - 配置允许的域名
  - 限制请求方法
  - 防止未授权访问

## 邮件告警

### 告警级别

当使用量达到阈值时，系统会发送邮件告警：

#### 警告阈值（默认 80%）
- 提醒注意监控
- 建议优化使用
- 不会影响服务运行

#### 严重阈值（默认 95%）
- 提醒尽快处理
- 建议准备扩容
- 可能影响服务稳定性

#### 停止阈值（默认 100%）
- 服务将被自动停止
- 需要手动恢复
- 避免额外费用

### 邮件配置

确保以下 SMTP 配置正确：
- `SMTP_HOST`: SMTP 服务器地址
- `SMTP_PORT`: SMTP 端口
- `SMTP_USER`: SMTP 用户名
- `SMTP_PASSWORD`: SMTP 密码
- `SMTP_FROM`: 发件人地址

## SMTP 配置说明

### UI 配置方式

登录系统后，可以在"设置"页面配置 SMTP：

#### 配置步骤
1. 登录系统
2. 点击"设置"标签
3. 填写 SMTP 配置信息：
   - **SMTP 服务器**：如 `smtp.gmail.com`
   - **端口**：如 `587`
   - **用户名**：邮箱地址
   - **密码**：邮箱密码或应用专用密码
   - **发件人**：显示的邮箱地址
4. 点击"保存"按钮

#### 配置说明
- **自定义 SMTP**：支持任何 SMTP 服务器
- **测试功能**：点击"发送测试邮件"验证配置
- **持久化**：配置保存在数据库中
- **用户独立**：每个用户可以有独立的 SMTP 配置

#### API 端点
- `GET /api/smtp-config` - 获取 SMTP 配置
- `PUT /api/smtp-config` - 更新 SMTP 配置
- `DELETE /api/smtp-config` - 删除 SMTP 配置
- `POST /api/smtp-config/test` - 发送测试邮件

### 环境变量配置

#### 默认配置

如果用户没有配置 SMTP，系统会使用环境变量中的默认配置：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Quota Orchestrator <noreply@example.com>
```

#### Gmail 配置

1. 启用两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `SMTP_PASSWORD`

#### 其他邮箱

- Outlook：`smtp-mail.outlook.com:587`
- Yahoo：`smtp.mail.yahoo.com:587`
- QQ邮箱：`smtp.qq.com:587`

### 邮件告警

### 告警级别

当使用量达到阈值时，系统会发送邮件告警：

#### 警告阈值（默认 80%）
- 提醒注意监控
- 建议优化使用
- 不会影响服务运行

#### 严重阈值（默认 95%）
- 提醒尽快处理
- 建议准备扩容
- 可能影响服务稳定性

#### 停止阈值（默认 100%）
- 服务将被自动停止
- 需要手动恢复
- 避免额外费用

### 邮件配置

确保以下 SMTP 配置正确：
- `SMTP_HOST`: SMTP 服务器地址
- `SMTP_PORT`: SMTP 端口
- `SMTP_USER`: SMTP 用户名
- `SMTP_PASSWORD`: SMTP 密码
- `SMTP_FROM`: 发件人地址

## 故障排查

### 数据库连接失败

检查以下几点：
1. PostgreSQL 是否运行：`systemctl status postgresql`
2. DATABASE_URL 是否正确
3. 数据库是否已创建：`psql -U postgres -l`
4. 防火墙是否开放 5432 端口

### 邮件发送失败

检查以下几点：
1. SMTP 配置是否正确
2. SMTP_PASSWORD 是否正确（Gmail 需要应用密码）
3. 邮箱是否正确
4. 查看后端日志：`docker-compose logs app`
5. 查看垃圾邮件文件夹

### 服务无法停止

检查以下几点：
1. 额度规则是否正确配置
2. 停止阈值是否已达到
3. API Token 是否有停止权限
4. 查看服务控制记录
5. 查看告警记录

### 应用响应慢

尝试以下优化：
1. 增加数据库连接池大小
2. 使用 Redis 缓存
3. 优化数据库查询
4. 使用 CDN 加速前端
5. 启用 gzip 压缩

### 内存占用高

尝试以下优化：
1. 限制日志文件大小
2. 配置日志轮转
3. 清理旧数据
4. 增加服务器内存
5. 使用内存监控工具

## 开发

### 生成 Prisma 客户端

```bash
npm run prisma:generate
```

### 数据库迁移

```bash
npm run prisma:migrate
```

### 打开 Prisma Studio

```bash
npm run prisma:studio
```

### 运行测试

```bash
npm test
```

### 生成测试覆盖率报告

```bash
npm run test:cov
```

### 构建

```bash
npm run build
```

## 更新和升级

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
npm install

# 3. 重新构建
npm run build

# 4. 重启服务
docker-compose restart app
```

### 数据库迁移

```bash
# 1. 创建新迁移
npx prisma migrate dev --name add_new_field

# 2. 应用迁移
npm run prisma:migrate

# 3. 生成 Prisma 客户端
npm run prisma:generate
```

## License

MIT License