-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "extra" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProviderConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProviderConfig" ("accountId", "apiToken", "createdAt", "extra", "id", "provider", "updatedAt", "userId") SELECT "accountId", "apiToken", "createdAt", "extra", "id", "provider", "updatedAt", "userId" FROM "ProviderConfig";
DROP TABLE "ProviderConfig";
ALTER TABLE "new_ProviderConfig" RENAME TO "ProviderConfig";
CREATE INDEX "ProviderConfig_provider_idx" ON "ProviderConfig"("provider");
CREATE INDEX "ProviderConfig_userId_idx" ON "ProviderConfig"("userId");
CREATE UNIQUE INDEX "ProviderConfig_provider_accountId_userId_key" ON "ProviderConfig"("provider", "accountId", "userId");
CREATE TABLE "new_UsageSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "metrics" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageSnapshot_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ProviderConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UsageSnapshot" ("accountId", "configId", "createdAt", "id", "metrics", "periodEnd", "periodStart", "provider", "raw") SELECT "accountId", "configId", "createdAt", "id", "metrics", "periodEnd", "periodStart", "provider", "raw" FROM "UsageSnapshot";
DROP TABLE "UsageSnapshot";
ALTER TABLE "new_UsageSnapshot" RENAME TO "UsageSnapshot";
CREATE INDEX "UsageSnapshot_configId_idx" ON "UsageSnapshot"("configId");
CREATE INDEX "UsageSnapshot_createdAt_idx" ON "UsageSnapshot"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
