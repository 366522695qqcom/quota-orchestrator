# GitHub 上传规范

## Why
为了确保代码变更能够一致、安全地上传到 GitHub，需要标准化的上传流程和规范。

## What Changes
- 定义标准的 Git 提交和推送流程
- 规范提交信息格式
- 确保代码在上传前通过构建验证
- 建立代码审查流程

## Impact
- 影响所有开发工作流程
- 影响版本控制和协作
- 影响持续集成/持续部署流程

## ADDED Requirements
### Requirement: 标准化上传流程
系统 SHALL 提供标准化的 GitHub 上传流程。

#### Scenario: 成功上传
- **WHEN** 开发者完成代码修改并通过构建验证
- **THEN** 代码应能够成功提交并推送到 GitHub 远程仓库

#### Scenario: 构建失败
- **WHEN** 代码修改导致构建失败
- **THEN** 系统应阻止上传并提示修复错误

### Requirement: 提交信息规范
系统 SHALL 强制使用规范的提交信息格式。

#### Scenario: 提交信息格式
- **WHEN** 创建新的 Git 提交
- **THEN** 提交信息应遵循格式：`[类型]: 简短描述`
- **THEN** 类型包括：fix, feat, docs, style, refactor, test, chore

### Requirement: 上传前验证
系统 SHALL 在上传前执行必要的验证。

#### Scenario: 代码构建验证
- **WHEN** 准备上传代码
- **THEN** 系统应先运行 `npm run build` 确保没有编译错误
- **THEN** 如果构建失败，应阻止上传

#### Scenario: Git 状态检查
- **WHEN** 准备上传代码
- **THEN** 系统应检查 Git 状态确保没有未跟踪的敏感文件
- **THEN** 应清理临时文件（如 .env, node_modules 等）

## MODIFIED Requirements
### Requirement: 现有上传流程
修改现有的手动上传流程，增加自动化验证步骤。

## REMOVED Requirements
无