// API Route: POST /api/uploads/sign
// Generates a presigned URL for direct upload to Cloudflare R2
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/services/db';
import { generatePresignedUploadUrl } from '@/lib/services/r2Storage';
import { randomUUID } from 'crypto';

// Request validation schema
const SignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/heic']),
  fileSize: z.number().positive().max(8000000), // 8MB max
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = SignRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { filename, contentType, fileSize } = validation.data;

    // Generate unique ID and R2 key
    const imageId = randomUUID();
    const fileExtension = filename.split('.').pop() || 'jpg';
    const r2Key = `uploads/${imageId}.${fileExtension}`;

    // Create database record with AWAITING_UPLOAD status
    const image = await prisma.image.create({
      data: {
        id: imageId,
        filename: `${imageId}.${fileExtension}`,
        originalName: filename,
        mimeType: contentType,
        r2Key,
        status: 'AWAITING_UPLOAD',
        fileSize,
        presignedUrlExpiry: new Date(Date.now() + 300000), // 5 minutes
      },
    });

    // Generate presigned URL for upload
    const uploadUrl = await generatePresignedUploadUrl(r2Key, contentType);

    return NextResponse.json({
      imageId: image.id,
      uploadUrl,
      r2Key,
      expiresAt: image.presignedUrlExpiry?.toISOString(),
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
