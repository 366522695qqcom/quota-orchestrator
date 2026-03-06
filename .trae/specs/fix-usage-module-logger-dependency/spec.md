# Fix UsageModule Logger Dependency Spec

## Why
UsageService 构造函数中注入了 LoggerService，但 UsageModule 没有导入 LoggerModule，导致 NestJS 无法解析依赖，应用启动失败并返回 500 错误。

## What Changes
- 在 UsageModule 的 imports 数组中添加 LoggerModule

## Impact
- Affected specs: None
- Affected code: src/usage/usage.module.ts

## ADDED Requirements
### Requirement: Fix Dependency Injection
UsageModule SHALL import LoggerModule to resolve LoggerService dependency

#### Scenario: Success case
- **WHEN** application starts
- **THEN** UsageService successfully injects LoggerService and application starts without errors
