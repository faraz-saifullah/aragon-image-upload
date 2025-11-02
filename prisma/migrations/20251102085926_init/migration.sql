-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('AWAITING_UPLOAD', 'VERIFYING', 'PROCESSING', 'ACCEPTED', 'REJECTED', 'UPLOAD_FAILED');

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "r2Key" TEXT NOT NULL,
    "r2Url" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'AWAITING_UPLOAD',
    "rejectionReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phash" TEXT,
    "blurScore" DOUBLE PRECISION,
    "faceCount" INTEGER,
    "faceSize" DOUBLE PRECISION,
    "presignedUrlExpiry" TIMESTAMP(3),
    "uploadCompletedAt" TIMESTAMP(3),
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastVerificationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_r2Key_key" ON "Image"("r2Key");

-- CreateIndex
CREATE INDEX "Image_status_idx" ON "Image"("status");

-- CreateIndex
CREATE INDEX "Image_createdAt_idx" ON "Image"("createdAt");

-- CreateIndex
CREATE INDEX "Image_phash_idx" ON "Image"("phash");
