"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  Upload,
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Download,
  Type,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  QUICK_ADD_MODIFIERS,
  type SubjectType,
  type BackgroundType,
  type LightingType,
  type MoodType,
} from "@/lib/ai/prompt-templates";
import { getTemplateInfo } from "@/lib/ai/prompt-builder";

interface PostGeneratorFormProps {
  onImageGenerated?: (imageUrl: string, postId: number) => void;
  onCaptionGenerated?: (caption: string) => void;
}

export function PostGeneratorForm({
  onImageGenerated,
  onCaptionGenerated,
}: PostGeneratorFormProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<"auto" | "manual">("auto");

  // Manual mode prompt (only for manual tab)
  const [manualPrompt, setManualPrompt] = useState("");

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  // Auto mode template selections (required)
  const [subjectType, setSubjectType] = useState<SubjectType>("lifestyle");
  const [background, setBackground] =
    useState<BackgroundType>("natural_outdoor");
  const [lighting, setLighting] = useState<LightingType>("golden_hour");
  const [mood, setMood] = useState<MoodType>("bright_airy");

  // Image-to-image state
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<
    string | null
  >(null);
  const [imageStrength, setImageStrength] = useState(0.5);

  // Get template info for dropdowns
  const templates = getTemplateInfo();

  const handleReferenceImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setReferenceImage(base64);
      setReferenceImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview(null);
  };

  const handleGenerateImage = async (): Promise<{ postId: number; imageUrl: string } | null> => {
    // Validation
    if (activeTab === "manual" && !manualPrompt.trim()) {
      toast.error("Please enter a prompt");
      return null;
    }

    setIsGeneratingImage(true);
    try {
      const requestBody: any = {
        prompt: activeTab === "auto" ? "Instagram post" : manualPrompt, // Auto mode sends generic prompt, templates do the work
        referenceImage,
        imagePromptStrength: referenceImage ? imageStrength : undefined,
        isManualPrompt: activeTab === "manual",
      };

      // Add template selections for auto mode
      if (activeTab === "auto") {
        requestBody.subjectType = subjectType;
        requestBody.background = background;
        requestBody.lighting = lighting;
        requestBody.mood = mood;
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImageUrl(data.imageUrl);
        setPostId(data.postId);
        toast.success("Image generated successfully!");
        onImageGenerated?.(data.imageUrl, data.postId);
        return { postId: data.postId, imageUrl: data.imageUrl };
      } else {
        toast.error(data.error || "Failed to generate image");
        return null;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateCaption = async (explicitPostId?: number) => {
    setIsGeneratingCaption(true);
    try {
      const captionPrompt =
        activeTab === "auto"
          ? `Create a caption for a ${subjectType} post with ${mood} mood`
          : manualPrompt;

      // Map mood to valid API tone
      const getToneFromMood = (mood: string): "professional" | "casual" | "funny" | "inspirational" | "educational" => {
        if (mood.includes("professional") || mood.includes("luxurious")) return "professional";
        if (mood.includes("playful") || mood.includes("fun")) return "funny";
        if (mood.includes("energetic") || mood.includes("vibrant")) return "inspirational";
        return "casual";
      };

      // Use explicit postId if provided, otherwise fall back to state
      const targetPostId = explicitPostId !== undefined ? explicitPostId : postId;

      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: captionPrompt,
          tone: activeTab === "auto" ? getToneFromMood(mood) : "casual",
          includeHashtags: true,
          includeEmojis: true,
          postId: targetPostId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCaption(data.caption);
        toast.success("Caption generated successfully!");
        onCaptionGenerated?.(data.caption);
      } else {
        toast.error(data.error || "Failed to generate caption");
      }
    } catch (error) {
      console.error("Error generating caption:", error);
      toast.error("Failed to generate caption");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleGenerateBoth = async () => {
    if (activeTab === "manual" && !manualPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Generate image first and get the postId
    const result = await handleGenerateImage();

    // If image generation succeeded, generate caption with the postId
    if (result) {
      await handleGenerateCaption(result.postId);
    }
  };

  const handleCopyCaption = () => {
    if (generatedCaption) {
      navigator.clipboard.writeText(generatedCaption);
      toast.success("Caption copied to clipboard!");
    }
  };

  const handleDownloadImage = async () => {
    if (generatedImageUrl && postId) {
      try {
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `instadream-${postId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading image:", error);
        toast.error("Failed to download image");
      }
    }
  };

  const insertQuickAddModifier = (modifier: string) => {
    setManualPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${modifier}` : modifier;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-20">
      {/* Main Generator */}
      <div className=" mb-4">
        <div className="space-y-4">
          {/* Reference Image Upload */}
          <div className="space-y-2">
            {referenceImagePreview ? (
              <div className="relative aspect-square h-80 mx-auto">
                <img
                  src={referenceImagePreview}
                  alt="Reference"
                  className="aspect-square h-80 mx-auto rounded-lg border object-contain"
                />
                <Button
                  size={"icon-sm"}
                  onClick={clearReferenceImage}
                  variant={"destructive"}
                  className="absolute top-1 right-2 p-1 bg-background border border-border rounded text-foreground hover:bg-secondary"
                >
                  <X className="w-4 h-4" />
                </Button>

                <div className="mt-2 hidden">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Strength: {Math.round(imageStrength * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={imageStrength}
                    onChange={(e) =>
                      setImageStrength(parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <label className="block aspect-square h-80 mx-auto">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageUpload}
                  className="hidden"
                />
                <div className="aspect-square h-80 rounded-xl p-6 text-center cursor-pointer bg-secondary/50 hover:border-primary hover:bg-secondary flex flex-col justify-center items-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-foreground" />
                  <p className="text-sm">Upload reference image</p>
                </div>
              </label>
            )}
          </div>

          {/* Tabs for Auto vs Manual Prompt */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "auto" | "manual")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="auto" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Auto Prompt
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Manual Prompt
              </TabsTrigger>
            </TabsList>

            {/* Auto Prompt Tab */}
            <TabsContent value="auto" className="space-y-4">
              {/* Subject Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject Type</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {templates.subjects.map((subject) => (
                    <button
                      key={subject.value}
                      onClick={() =>
                        setSubjectType(subject.value as SubjectType)
                      }
                      className={`p-2 rounded border transition-all text-left ${
                        subjectType === subject.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary hover:bg-secondary"
                      }`}
                    >
                      <div className="text-2xl mb-1">{subject.emoji}</div>
                      <div className="text-sm font-medium">{subject.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {templates.backgrounds.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setBackground(bg.value as BackgroundType)}
                      className={`p-2 rounded border transition-all text-left ${
                        background === bg.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary hover:bg-secondary"
                      }`}
                    >
                      <div className="text-2xl mb-1">{bg.emoji}</div>
                      <div className="text-sm font-medium">{bg.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lighting</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {templates.lighting.map((light) => (
                    <button
                      key={light.value}
                      onClick={() => setLighting(light.value as LightingType)}
                      className={`p-2 rounded border transition-all text-left ${
                        lighting === light.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary hover:bg-secondary"
                      }`}
                    >
                      <div className="text-2xl mb-1">{light.emoji}</div>
                      <div className="text-sm font-medium">{light.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mood</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
                  {templates.moods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value as MoodType)}
                      className={`p-2 rounded border transition-all text-left ${
                        mood === m.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary hover:bg-secondary"
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.emoji}</div>
                      <div className="text-sm font-medium">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Manual Prompt Tab */}
            <TabsContent value="manual" className="space-y-3">
              {/* Manual Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Full Manual Prompt
                </label>
                <textarea
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  placeholder="Professional photography of a woman drinking coffee in a cozy cafe, warm lighting, natural window light, Instagram aesthetic, sharp focus, 8k..."
                  className="w-full p-3 border border-border rounded min-h-[150px] resize-none bg-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>

              {/* Quick Add Modifiers */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Quick-Add Modifiers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ADD_MODIFIERS.map((modifier) => (
                    <Button
                      key={modifier.label}
                      variant="outline"
                      size="sm"
                      onClick={() => insertQuickAddModifier(modifier.value)}
                      className="text-xs h-7"
                    >
                      + {modifier.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 p-2 sticky bottom-0">
            <Button
              onClick={handleGenerateBoth}
              disabled={isGeneratingImage || isGeneratingCaption}
              className="flex-1 bg-linear-to-b text-lg from-primary to-rose-900 rounded-full h-13"
              size={"lg"}
            >
              <Sparkles className="" />
              {isGeneratingImage || isGeneratingCaption
                ? "Generating..."
                : "Generate Post"}
            </Button>
            {/* <Button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
              variant="outline"
              className="h-10"
            >
              {isGeneratingImage ? "Generating..." : "Image Only"}
            </Button>
            <Button
              onClick={handleGenerateCaption}
              disabled={isGeneratingCaption}
              variant="outline"
              className="h-10"
            >
              {isGeneratingCaption ? "Generating..." : "Caption Only"}
            </Button> */}
          </div>
        </div>
      </div>

      {/* Generated Instagram Post Preview */}
      {generatedImageUrl && (
        <div className="border border-border max-w-xl mx-auto rounded-lg overflow-hidden bg-background">
          {/* Post Header */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xs font-semibold">
                  AI
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Generated Image</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Download image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyCaption}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Copy caption
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Image */}
          <div className="relative w-full aspect-square bg-secondary">
            <img
              src={generatedImageUrl}
              alt="Generated post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Action Buttons */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="hover:text-muted-foreground transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
                <button className="hover:text-muted-foreground transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="hover:text-muted-foreground transition-colors">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button className="hover:text-muted-foreground transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            {/* Likes Count */}
            {isLiked && <p className="text-sm font-semibold">1 like</p>}

            {/* Caption */}
            {generatedCaption && (
              <div className="text-sm">
                <span className="font-semibold">instadream_ai </span>
                <span className="whitespace-pre-wrap">{generatedCaption}</span>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground uppercase">Just now</p>
          </div>
        </div>
      )}
    </div>
  );
}
