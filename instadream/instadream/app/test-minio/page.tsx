'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestMinioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/test-minio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">MinIO Upload Test</h1>

        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select an image to upload
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload to MinIO'}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold mb-2">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold mb-2">
                  ✓ Upload Successful!
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Storage Key:</span>{' '}
                    <code className="bg-white px-2 py-1 rounded">
                      {result.data.storageKey}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium">File Type:</span>{' '}
                    {result.data.fileType}
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span>{' '}
                    {(result.data.fileSize / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>

              {/* Image URL and Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={result.data.imageUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(result.data.imageUrl);
                      alert('URL copied to clipboard!');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => window.open(result.data.imageUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    Open
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview:
                </label>
                <img
                  src={result.data.imageUrl}
                  alt="Uploaded to MinIO"
                  className="w-full rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    setError(
                      'Image uploaded but failed to load. Check CORS settings or bucket policy.'
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Select an image file</li>
              <li>Click "Upload to MinIO"</li>
              <li>
                If successful, you'll see the URL and a preview of the uploaded
                image
              </li>
              <li>
                If you see an error, check your MinIO credentials and bucket
                configuration
              </li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
