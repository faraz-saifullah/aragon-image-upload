// API Route: GET /api/images/[id]
// Returns current status and metadata for an image upload
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Fetch image record
    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        width: true,
        height: true,
        r2Key: true,
        r2Url: true,
        status: true,
        rejectionReasons: true,
        phash: true,
        blurScore: true,
        faceCount: true,
        faceSize: true,
        createdAt: true,
        updatedAt: true,
        processedAt: true,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
