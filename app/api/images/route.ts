// API Route: GET /api/images
// Returns all images, optionally filtered by status
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where = status ? { status } : {};

    // Fetch images
    const images = await prisma.image.findMany({
      where,
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
        createdAt: true,
        updatedAt: true,
        processedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
