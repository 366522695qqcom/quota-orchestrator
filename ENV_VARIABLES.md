# 环境变量说明

## ✅ 简化完成
2026-03-01

---

## 📋 必需环境变量

### 1. DATABASE_URL
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quota_orchestrator
```

**说明**：PostgreSQL 数据库连接字符串

**格式**：`postgresql://[用户名]:[密码]@[主机]:[端口]/[数据库名]`

**示例**：
- 本地：`postgresql://postgres:postgres@localhost:5432/quota_orchestrator`
- Docker：`postgresql://postgres:postgres@postgres:5432/quota_orchestrator`
- 云数据库：`postgresql://user:password@host.rds.amazonaws.com:5432/quota_orchestrator`

---

### 2. ADMIN_USERNAME
```env
ADMIN_USERNAME=admin
```

**说明**：管理员用户名，用于登录系统

**默认值**：`admin`

---

### 3. ADMIN_PASSWORD
```env
ADMIN_PASSWORD=admin123
```

**说明**：管理员密码，用于登录系统

**安全建议**：
- 使用强密码（至少12个字符）
- 包含大小写字母、数字和特殊字符
- 不要使用默认密码

---

### 4. ENCRYPTION_KEY
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

---

### 5. JWT_SECRET
```env
JWT_SECRET=your-jwt-secret-key-change-this-in-production
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

---

## 📊 可选环境变量（有默认值）

以下变量有默认值，可以不配置：

| 变量名 | 默认值 | 说明 |
|---------|---------|------|
| SESSION_TTL_SECONDS | 43200 (12小时) | 会话过期时间（秒） |
| PORT | 3000 | 服务端口 |
| SMTP_HOST | smtp.gmail.com | SMTP服务器地址 |
| SMTP_PORT | 587 | SMTP端口 |
| SMTP_USER | your-email@gmail.com | SMTP用户名 |
| SMTP_PASSWORD | your-app-password | SMTP密码 |
| SMTP_FROM | Quota Orchestrator <noreply@example.com> | 发件人地址 |
| BACKUP_DIR | ./backups | 备份文件目录 |
| LOG_DIR | ./logs | 日志文件目录 |
| LOG_LEVEL | info | 日志级别 |

---

## SMTP 配置说明

### 概述

SMTP 配置不是必需的，但强烈建议配置以启用邮件告警功能。

### 配置方式

#### 方式1：UI 配置（推荐）

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

#### 优势
- ✅ 用户界面友好
- ✅ 配置持久化存储
- ✅ 支持自定义 SMTP 服务器
- ✅ 支持测试邮件发送
- ✅ 每个用户独立配置

#### 方式2：环境变量配置

如果不想使用 UI 配置，可以直接在 `.env` 文件中配置：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Quota Orchestrator <noreply@example.com>
```

**注意**：环境变量中的配置是全局默认值，所有用户共享。

### Gmail 配置

1. 启用两步验证
2. 生成应用专用密码
3. 使用应用密码作为 `SMTP_PASSWORD`

### 其他邮箱

- Outlook：`smtp-mail.outlook.com:587`
- Yahoo：`smtp.mail.yahoo.com:587`
- QQ邮箱：`smtp.qq.com:587`

---

## 🎯 快速开始

### 1. 创建 .env 文件
```bash
# 复制模板
cp .env.example .env

# 编辑文件（只配置必需的5个变量）
```

### 2. 最小配置示例
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quota_orchestrator

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456

JWT_SECRET=your-jwt-secret-key-change-this-in-production
```

### 3. 启动服务
```bash
# Docker 方式（推荐）
docker-compose up -d

# 本地开发方式
npm run start:dev
```

---

## 📝 注意事项

### 安全提醒
- ⚠️ .env 文件包含敏感信息
- ✅ .env 已在 .gitignore 中
- ⚠️ 生产环境部署前请修改默认密码和密钥
- ⚠️ 特别是：
  - `ADMIN_PASSWORD`
  - `ENCRYPTION_KEY`
  - `JWT_SECRET`

### 配置建议
- ✅ 只需配置5个必需变量
- ✅ 其他变量使用默认值
- ✅ 根据需要调整可选变量

---

## 🔧 高级配置

### 如果需要自定义可选变量

```env
# 会话过期时间（默认12小时）
SESSION_TTL_SECONDS=86400

# 服务端口（默认3000）
PORT=8080

# 邮件配置（需要告警功能）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Quota Orchestrator <noreply@example.com>

# 备份目录（默认./backups）
BACKUP_DIR=/var/backups/quota-orchestrator

# 日志目录（默认./logs）
LOG_DIR=/var/log/quota-orchestrator

# 日志级别（默认info）
LOG_LEVEL=debug
```

---

## 🚀 快速测试

### 1. 测试数据库连接
```bash
# 确保数据库运行
psql -U postgres -h localhost -p 5432

# 查看数据库
psql -U postgres -h localhost -p 5432 -l
```

### 2. 测试应用启动
```bash
# 启动开发服务器
npm run start:dev

# 检查日志
# 查看控制台输出
```

---

## 📚 更多信息

- 📖 查看详细安装指南：[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
- 📖 查看项目文档：[README.md](./README.md)
- 📖 查看开发总结：[DEVELOPMENT_SUMMARY.md]
- 📖 查看功能改进：[IMPROVEMENTS_SUMMARY.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-03-01  
**维护者**: Quota Orchestrator Team