-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "extra" JSONB,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProviderConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsageSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "metrics" JSONB NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageSnapshot_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ProviderConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuotaRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "limitValue" REAL NOT NULL,
    "warningThreshold" REAL NOT NULL,
    "criticalThreshold" REAL NOT NULL,
    "stopThreshold" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuotaRule_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ProviderConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "threshold" REAL NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ServiceControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedBy" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    CONSTRAINT "ServiceControl_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ProviderConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduledRecovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "ProviderConfig_provider_idx" ON "ProviderConfig"("provider");

-- CreateIndex
CREATE INDEX "ProviderConfig_userId_idx" ON "ProviderConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderConfig_provider_accountId_userId_key" ON "ProviderConfig"("provider", "accountId", "userId");

-- CreateIndex
CREATE INDEX "UsageSnapshot_configId_idx" ON "UsageSnapshot"("configId");

-- CreateIndex
CREATE INDEX "UsageSnapshot_createdAt_idx" ON "UsageSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "QuotaRule_configId_idx" ON "QuotaRule"("configId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaRule_configId_metricName_key" ON "QuotaRule"("configId", "metricName");

-- CreateIndex
CREATE INDEX "Alert_configId_idx" ON "Alert"("configId");

-- CreateIndex
CREATE INDEX "Alert_sentAt_idx" ON "Alert"("sentAt");

-- CreateIndex
CREATE INDEX "ServiceControl_configId_idx" ON "ServiceControl"("configId");

-- CreateIndex
CREATE INDEX "ServiceControl_executedAt_idx" ON "ServiceControl"("executedAt");

-- CreateIndex
CREATE INDEX "ScheduledRecovery_configId_idx" ON "ScheduledRecovery"("configId");

-- CreateIndex
CREATE INDEX "ScheduledRecovery_scheduledFor_idx" ON "ScheduledRecovery"("scheduledFor");
