"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ImagePreviewProps {
  imageUrl: string;
  caption?: string;
  prompt?: string;
  onDownload?: () => void;
}

export function ImagePreview({
  imageUrl,
  caption,
  prompt,
  onDownload,
}: ImagePreviewProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(imageUrl, "_blank");
    }
  };

  const handleCopyImage = async () => {
    try {
      // Copy image URL to clipboard
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy image URL");
    }
  };

  const handleCopyCaption = async () => {
    if (caption) {
      try {
        await navigator.clipboard.writeText(caption);
        toast.success("Caption copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy caption");
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Instagram Post",
          text: caption || prompt || "Check out my generated post!",
          url: imageUrl,
        });
      } catch (error) {
        // User cancelled share or share failed
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy URL
      handleCopyImage();
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={imageUrl}
          alt={prompt || "Generated Instagram post"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Download className="" />
            Download
          </Button>
          <Button
            onClick={handleCopyImage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Copy className="" />
            Copy URL
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Share2 className="" />
            Share
          </Button>
        </div>

        {/* Caption */}
        {caption && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Caption</h4>
              <Button onClick={handleCopyCaption} variant="ghost" size="sm">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {caption}
            </p>
          </div>
        )}

        {/* Prompt */}
        {prompt && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-gray-500 mb-1">
              Original Prompt
            </h4>
            <p className="text-xs text-gray-600">{prompt}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
