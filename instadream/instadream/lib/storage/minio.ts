import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'instadream';

/**
 * Ensures the bucket exists, creates it if not
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

/**
 * Uploads an image buffer to MinIO with a UUID filename
 * @param imageBuffer - The image buffer to upload
 * @param contentType - The MIME type of the image (e.g., 'image/png')
 * @returns The storage key (UUID filename)
 */
export async function uploadImage(
  imageBuffer: Buffer,
  contentType: string = 'image/png'
): Promise<{ storageKey: string; imageUrl: string }> {
  try {
    await ensureBucketExists();

    // Generate UUID for flat file structure
    const fileExtension = contentType.split('/')[1] || 'png';
    const storageKey = `${uuidv4()}.${fileExtension}`;

    const metadata = {
      'Content-Type': contentType,
    };

    await minioClient.putObject(
      BUCKET_NAME,
      storageKey,
      imageBuffer,
      imageBuffer.length,
      metadata
    );

    // Generate the public URL
    const imageUrl = getImageUrl(storageKey);

    return { storageKey, imageUrl };
  } catch (error) {
    console.error('Error uploading image to MinIO:', error);
    throw error;
  }
}

/**
 * Gets the public URL for an image
 * @param storageKey - The storage key (UUID filename)
 * @returns The public URL
 */
export function getImageUrl(storageKey: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';

  // Don't include port in URL if it's the default port (443 for HTTPS, 80 for HTTP)
  const isDefaultPort =
    (protocol === 'https' && port === '443') ||
    (protocol === 'http' && port === '80');

  const urlBase = isDefaultPort
    ? `${protocol}://${endpoint}`
    : `${protocol}://${endpoint}:${port}`;

  return `${urlBase}/${BUCKET_NAME}/${storageKey}`;
}

/**
 * Downloads an image from MinIO
 * @param storageKey - The storage key (UUID filename)
 * @returns The image buffer
 */
export async function downloadImage(storageKey: string): Promise<Buffer> {
  try {
    const dataStream = await minioClient.getObject(BUCKET_NAME, storageKey);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      dataStream.on('data', (chunk) => chunks.push(chunk));
      dataStream.on('end', () => resolve(Buffer.concat(chunks)));
      dataStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image from MinIO:', error);
    throw error;
  }
}

/**
 * Deletes an image from MinIO
 * @param storageKey - The storage key (UUID filename)
 */
export async function deleteImage(storageKey: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, storageKey);
  } catch (error) {
    console.error('Error deleting image from MinIO:', error);
    throw error;
  }
}

/**
 * Uploads an image from a URL
 * @param imageUrl - The URL of the image to download and upload
 * @returns The storage key and MinIO URL
 */
export async function uploadImageFromUrl(
  imageUrl: string
): Promise<{ storageKey: string; imageUrl: string }> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/png';

    return await uploadImage(imageBuffer, contentType);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
}
