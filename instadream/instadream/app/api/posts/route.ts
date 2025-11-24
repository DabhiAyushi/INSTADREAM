import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatedPosts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * GET /api/posts
 * Fetches all generated posts, optionally filtered by status
 * Query params:
 * - status: 'pending' | 'generating' | 'completed' | 'failed'
 * - limit: number (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query based on whether status filter is provided
    const posts = status && ['pending', 'generating', 'completed', 'failed'].includes(status)
      ? await db
          .select()
          .from(generatedPosts)
          .where(eq(generatedPosts.status, status as 'pending' | 'generating' | 'completed' | 'failed'))
          .orderBy(desc(generatedPosts.createdAt))
          .limit(limit)
      : await db
          .select()
          .from(generatedPosts)
          .orderBy(desc(generatedPosts.createdAt))
          .limit(limit);

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('Error in posts API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[id]
 * Fetches a single post by ID
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const [post] = await db
      .select()
      .from(generatedPosts)
      .where(eq(generatedPosts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Error in posts API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch post',
      },
      { status: 500 }
    );
  }
}
