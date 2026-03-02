# Quota Orchestrator 安装和使用指南

## 📚 目录

1. [系统要求](#系统要求)
2. [快速开始](#快速开始)
3. [环境变量配置](#环境变量配置)
4. [获取 API Token](#获取-api-token)
5. [安装步骤](#安装步骤)
6. [启动服务](#启动服务)
7. [使用指南](#使用指南)
8. [常见问题](#常见问题)

---

## 系统要求

### 必需软件
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 15.0
- **Git**: 用于克隆代码

### 可选软件
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0

### 推荐配置
- **CPU**: 2核或更多
- **内存**: 4GB或更多
- **磁盘**: 20GB或更多
- **网络**: 稳定的互联网连接

---

## 快速开始

### 方式1：Docker 部署（推荐）

```bash
# 1. 克隆代码
git clone <your-repo-url>
cd quota-orchestrator

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置必要的变量

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

### 方式2：本地开发

```bash
# 1. 克隆代码
git clone <your-repo-url>
cd quota-orchestrator

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 生成 Prisma 客户端
npm run prisma:generate

# 5. 运行数据库迁移
npm run prisma:migrate

# 6. 启动开发服务器
npm run start:dev
```

---

## 环境变量配置

### 必需变量

#### DATABASE_URL
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quota_orchestrator
```
**说明**：PostgreSQL 数据库连接字符串

**格式**：`postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]`

**示例**：
- 本地：`postgresql://postgres:postgres@localhost:5432/quota_orchestrator`
- Docker：`postgresql://postgres:postgres@postgres:5432/quota_orchestrator`
- 云数据库：`postgresql://user:password@host.rds.amazonaws.com:5432/quota_orchestrator`

#### ADMIN_USERNAME
```env
ADMIN_USERNAME=admin
```
**说明**：管理员用户名，用于登录系统

**默认值**：`admin`

#### ADMIN_PASSWORD
```env
ADMIN_PASSWORD=your-secure-password
```
**说明**：管理员密码，用于登录系统

**安全建议**：
- 使用强密码（至少12个字符）
- 包含大小写字母、数字和特殊字符
- 不要使用默认密码

#### ENCRYPTION_KEY
```env
ENCRYPTION_KEY=your-32-character-encryption-key-here
```
**说明**：AES-256 加密密钥，用于加密 API Token

**要求**：必须是32个字符

**生成方法**：
```bash
# 方法1：使用 openssl
openssl rand -hex 32

# 方法2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法3：使用在线生成器
# 访问：https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on&unique=on&format=hex
```

#### JWT_SECRET
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

### 可选变量

#### SESSION_TTL_SECONDS
```env
SESSION_TTL_SECONDS=43200
```
**说明**：会话过期时间（秒）

**默认值**：`43200`（12小时）

**建议值**：
- 开发环境：`86400`（24小时）
- 生产环境：`43200`（12小时）
- 高安全环境：`3600`（1小时）

#### PORT
```env
PORT=3000
```
**说明**：后端服务端口

**默认值**：`3000`

**注意事项**：
- 确保端口未被占用
- 防火墙需要开放该端口

#### SMTP 配置
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

#### BACKUP_DIR
```env
BACKUP_DIR=./backups
```
**说明**：数据库备份文件存储目录

**默认值**：`./backups`

**建议**：
- 使用绝对路径：`/var/backups/quota-orchestrator`
- 确保目录有写权限
- 定期清理旧备份

#### LOG_DIR
```env
LOG_DIR=./logs
```
**说明**：日志文件存储目录

**默认值**：`./logs`

**建议**：
- 使用绝对路径：`/var/log/quota-orchestrator`
- 确保目录有写权限
- 配置日志轮转

#### LOG_LEVEL
```env
LOG_LEVEL=info
```
**说明**：日志级别

**可选值**：
- `error`：只记录错误
- `warn`：记录警告和错误
- `info`：记录信息、警告和错误（默认）
- `debug`：记录所有级别（开发环境）

---

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

---

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

#### 步骤5：验证安装
```bash
# 检查后端服务
curl http://localhost:3000/api/health

# 检查前端服务
curl http://localhost:5173
```

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

---

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

---

## 使用指南

### 1. 登录系统

#### 访问应用
- **前端地址**：http://localhost:5173
- **后端 API**：http://localhost:3000/api
- **Swagger 文档**：http://localhost:3000/api

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

### 8. 配置 SMTP 邮件

#### UI 配置方式

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
- **环境变量**：如果用户没有配置，使用环境变量中的默认值

#### API 端点
- `GET /api/smtp-config` - 获取 SMTP 配置
- `PUT /api/smtp-config` - 更新 SMTP 配置
- `DELETE /api/smtp-config` - 删除 SMTP 配置
- `POST /api/smtp-config/test` - 发送测试邮件

---

## 常见问题

### 安装问题

#### Q: Docker 启动失败？
**A**: 检查以下几点：
1. Docker 是否正确安装：`docker --version`
2. 端口是否被占用：`netstat -an | grep 3000`
3. 环境变量是否正确配置
4. 查看日志：`docker-compose logs app`

#### Q: 数据库连接失败？
**A**: 检查以下几点：
1. PostgreSQL 是否运行：`systemctl status postgresql`
2. DATABASE_URL 是否正确
3. 数据库是否已创建：`psql -U postgres -l`
4. 防火墙是否开放 5432 端口

#### Q: 依赖安装失败？
**A**: 尝试以下方法：
1. 清除缓存：`npm cache clean --force`
2. 删除 node_modules：`rm -rf node_modules`
3. 重新安装：`npm install`
4. 使用淘宝镜像：`npm install --registry=https://registry.npmmirror.com`

### 使用问题

#### Q: 无法登录？
**A**: 检查以下几点：
1. 用户名和密码是否正确
2. 管理员账户是否已创建
3. 查看后端日志：`docker-compose logs app`
4. 检查 JWT_SECRET 是否配置

#### Q: Provider 配置测试失败？
**A**: 检查以下几点：
1. API Token 是否正确
2. Token 是否有足够权限
3. Account ID 是否正确
4. 网络连接是否正常
5. Provider API 是否正常运行

#### Q: 邮件告警未收到？
**A**: 检查以下几点：
1. SMTP 配置是否正确
2. SMTP_PASSWORD 是否正确（Gmail 需要应用密码）
3. 邮箱是否正确
4. 检查后端日志：`docker-compose logs app`
5. 查看垃圾邮件文件夹

#### Q: 服务未自动停止？
**A**: 检查以下几点：
1. 额度规则是否正确配置
2. 停止阈值是否已达到
3. API Token 是否有停止权限
4. 查看服务控制记录
5. 查看告警记录

### 性能问题

#### Q: 应用响应慢？
**A**: 尝试以下优化：
1. 增加数据库连接池大小
2. 使用 Redis 缓存
3. 优化数据库查询
4. 使用 CDN 加速前端
5. 启用 gzip 压缩

#### Q: 内存占用高？
**A**: 尝试以下优化：
1. 限制日志文件大小
2. 配置日志轮转
3. 清理旧数据
4. 增加服务器内存
5. 使用内存监控工具

### 安全问题

#### Q: 如何保护 .env 文件？
**A**: 使用以下方法：
1. 确保 .env 在 .gitignore 中
2. 设置文件权限：`chmod 600 .env`
3. 使用环境变量管理工具（如 Vault）
4. 定期更换密钥

#### Q: 如何保护 API Token？
**A**: 使用以下方法：
1. 使用加密存储（系统已实现）
2. 不要在代码中硬编码
3. 定期更换 Token
4. 使用最小权限原则
5. 监控异常使用

---

## 高级配置

### 数据库优化

#### 连接池配置
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quota_orchestrator?connection_limit=10&pool_timeout=20
```

#### 查询优化
- 添加数据库索引
- 使用分页查询
- 避免 N+1 查询
- 使用查询缓存

### 缓存配置

#### Redis 缓存（未来功能）
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 日志配置

#### 日志级别
```env
LOG_LEVEL=debug  # 开发环境
LOG_LEVEL=info   # 生产环境
LOG_LEVEL=error  # 高安全环境
```

#### 日志轮转
```env
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d
```

---

## 监控和维护

### 应用监控

#### 健康检查
```bash
# 检查后端健康
curl http://localhost:3000/api/health

# 检查数据库连接
npm run prisma:studio
```

#### 日志监控
```bash
# 查看实时日志
docker-compose logs -f app

# 查看错误日志
tail -f logs/error-*.log
```

### 数据库维护

#### 备份策略
- 每日自动备份
- 保留最近 30 天的备份
- 定期清理旧备份

#### 数据清理
```bash
# 清理 30 天前的使用量快照
npm run prisma:studio
# 手动删除或编写清理脚本
```

---

## 故障排查

### 启动问题

#### 检查清单
- [ ] Node.js 版本 >= 18.0.0
- [ ] npm 版本 >= 8.0.0
- [ ] PostgreSQL 版本 >= 15.0
- [ ] 端口 3000 未被占用
- [ ] 端口 5432 未被占用
- [ ] .env 文件存在且配置正确
- [ ] 数据库已创建

### 运行时问题

#### 检查清单
- [ ] 后端服务正在运行
- [ ] 前端服务正在运行
- [ ] 数据库连接正常
- [ ] 日志无错误
- [ ] API 响应正常

### 性能问题

#### 检查清单
- [ ] CPU 使用率 < 80%
- [ ] 内存使用率 < 80%
- [ ] 磁盘使用率 < 80%
- [ ] 网络延迟 < 100ms
- [ ] 数据库查询时间 < 100ms

---

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

---

## 支持和帮助

### 获取帮助

- 📧 **GitHub Issues**: [提交问题](https://github.com/your-repo/issues)
- 📧 **文档**: [查看文档](https://github.com/your-repo/wiki)
- 💬 **讨论**: [参与讨论](https://github.com/your-repo/discussions)

### 贡献代码

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

## 许可证

MIT License

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-01  
**维护者**: Quota Orchestrator Team