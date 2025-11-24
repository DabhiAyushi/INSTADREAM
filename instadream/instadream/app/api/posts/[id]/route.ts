import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatedPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteImage } from '@/lib/storage/minio';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Get the post to find storage keys
    const [post] = await db
      .select()
      .from(generatedPosts)
      .where(eq(generatedPosts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete images from MinIO if they exist
    try {
      if (post.storageKey) {
        await deleteImage(post.storageKey);
      }
      if (post.referenceStorageKey) {
        await deleteImage(post.referenceStorageKey);
      }
    } catch (error) {
      console.error('Error deleting images from MinIO:', error);
      // Continue with database deletion even if MinIO deletion fails
    }

    // Delete the post from database
    await db
      .delete(generatedPosts)
      .where(eq(generatedPosts.id, postId));

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete post',
      },
      { status: 500 }
    );
  }
}
