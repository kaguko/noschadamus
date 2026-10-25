-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'vi',
    "spreadId" TEXT NOT NULL,
    "allowReversed" BOOLEAN NOT NULL,
    "title" TEXT NOT NULL,
    "cards" JSONB NOT NULL,
    "soulMap" JSONB NOT NULL,
    "interpretation" JSONB NOT NULL,
    "intention" TEXT,
    "shareToken" TEXT,
    "sharedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorHash" TEXT NOT NULL,
    "props" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reading_shareToken_key" ON "Reading"("shareToken");

-- CreateIndex
CREATE INDEX "Reading_createdAt_idx" ON "Reading"("createdAt");

-- CreateIndex
CREATE INDEX "Reading_lastViewedAt_idx" ON "Reading"("lastViewedAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_occurredAt_idx" ON "AnalyticsEvent"("name", "occurredAt");
