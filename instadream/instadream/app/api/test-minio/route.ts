import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage/minio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Uploading file to MinIO:', file.name, file.type, file.size);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to MinIO
    const { storageKey, imageUrl } = await uploadImage(buffer, file.type);

    console.log('Upload successful!', { storageKey, imageUrl });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to MinIO',
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storageKey,
        imageUrl,
      },
    });
  } catch (error) {
    console.error('MinIO upload test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
