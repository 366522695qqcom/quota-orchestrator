# 统一UI管理系统 Spec

## Why
当前项目存在前后端分离的架构，前端（React + Vite）和后端（NestJS）分开管理。用户希望创建一个全新的统一管理界面，整合所有功能到一个现代化的单页面应用中，提供更好的用户体验和统一的管理体验。

## What Changes
- 创建全新的统一UI管理系统
- 整合所有现有功能到统一界面
- 采用现代化的UI设计
- 实现响应式布局
- 添加实时数据更新
- 优化用户体验流程

## Impact
- Affected specs: None
- Affected code: web/ 目录需要重构，src/ 目录需要添加新的UI相关代码

## ADDED Requirements
### Requirement: 统一管理界面
系统 SHALL 提供一个统一的Web管理界面，整合所有配额管理功能。

#### Scenario: 用户登录
- **WHEN** 用户访问管理系统
- **THEN** 显示登录界面，用户可以输入凭据进行认证

#### Scenario: Provider配置管理
- **WHEN** 用户进入Provider配置页面
- **THEN** 用户可以添加、编辑、测试、删除Provider配置

#### Scenario: 使用情况监控
- **WHEN** 用户查看使用情况
- **THEN** 显示实时使用数据、图表、告警信息

#### Scenario: 服务控制
- **WHEN** 用户需要控制服务
- **THEN** 用户可以停止、启动、重启服务

#### Scenario: 数据库备份
- **WHEN** 用户需要备份数据
- **THEN** 用户可以创建、下载、恢复、删除备份

#### Scenario: 额度规则管理
- **WHEN** 用户配置额度规则
- **THEN** 用户可以添加、编辑、删除额度规则

#### Scenario: SMTP配置
- **WHEN** 用户配置SMTP服务
- **THEN** 用户可以设置SMTP参数、测试邮件发送

## MODIFIED Requirements
### Requirement: 现有UI重构
现有的React UI需要重构以适应新的统一管理界面。

## REMOVED Requirements
无