# Fix UsageModule RetryService Dependency Spec

## Why
UsageService 构造函数中注入了 RetryService，但 UsageModule 的 providers 数组中没有包含 RetryService，导致 NestJS 无法解析依赖，应用启动失败并返回 500 错误。

## What Changes
- 在 UsageModule 的 providers 数组中添加 RetryService

## Impact
- Affected specs: None
- Affected code: src/usage/usage.module.ts

## ADDED Requirements
### Requirement: Fix Dependency Injection
UsageModule SHALL include RetryService in its providers array

#### Scenario: Success case
- **WHEN** application starts
- **THEN** UsageService successfully injects RetryService and application starts without errors
