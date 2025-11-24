import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadImageFromUrl } from '@/lib/storage/minio';
import { z } from 'zod';

const UploadFromUrlSchema = z.object({
  imageUrl: z.string().url('Must be a valid URL'),
});

const UploadFromBase64Schema = z.object({
  imageData: z.string().min(1, 'Image data is required'),
  contentType: z.string().optional().default('image/png'),
});

/**
 * POST /api/upload-storage
 * Uploads an image to MinIO storage
 * Supports both URL and base64 uploads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine upload method
    if (body.imageUrl) {
      // Upload from URL
      const { imageUrl } = UploadFromUrlSchema.parse(body);

      console.log('Uploading image from URL:', imageUrl);
      const result = await uploadImageFromUrl(imageUrl);

      return NextResponse.json({
        success: true,
        ...result,
      });
    } else if (body.imageData) {
      // Upload from base64
      const { imageData, contentType } = UploadFromBase64Schema.parse(body);

      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      console.log('Uploading image from base64');
      const result = await uploadImage(imageBuffer, contentType);

      return NextResponse.json({
        success: true,
        ...result,
      });
    } else if (body.imageBuffer) {
      // Upload from buffer (sent as array)
      const imageBuffer = Buffer.from(body.imageBuffer);
      const contentType = body.contentType || 'image/png';

      console.log('Uploading image from buffer');
      const result = await uploadImage(imageBuffer, contentType);

      return NextResponse.json({
        success: true,
        ...result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Must provide either imageUrl, imageData, or imageBuffer',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in upload-storage API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
