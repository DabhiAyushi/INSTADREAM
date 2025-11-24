import { NextRequest, NextResponse } from "next/server";
import { generateInstagramPost } from "@/lib/ai/replicate";
import { uploadImageFromUrl, uploadImage } from "@/lib/storage/minio";
import { db } from "@/lib/db";
import { generatedPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { buildEnhancedPrompt, validatePromptOptions } from "@/lib/ai/prompt-builder";

const GenerateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  subjectType: z.enum([
    "portrait",
    "lifestyle",
    "product",
    "food",
    "landscape",
    "interior",
    "abstract",
    "fashion",
  ]).optional(),
  background: z.enum([
    "minimal_white",
    "natural_outdoor",
    "urban_city",
    "studio_setup",
    "indoor_cozy",
    "textured",
    "gradient",
    "bokeh",
  ]).optional(),
  lighting: z.enum([
    "golden_hour",
    "studio_lighting",
    "natural_window",
    "dramatic",
    "soft_diffused",
    "blue_hour",
    "backlit",
    "harsh_shadows",
  ]).optional(),
  mood: z.enum([
    "warm_cozy",
    "energetic_vibrant",
    "luxurious_elegant",
    "calm_serene",
    "professional_clean",
    "playful_fun",
    "dark_moody",
    "bright_airy",
  ]).optional(),
  postId: z.number().optional(),
  referenceImage: z.string().optional(), // URL or base64
  imagePromptStrength: z.number().min(0).max(1).optional(),
  isManualPrompt: z.boolean().optional(), // If true, skip template building
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      subjectType,
      background,
      lighting,
      mood,
      postId,
      referenceImage,
      imagePromptStrength,
      isManualPrompt = false,
    } = GenerateImageSchema.parse(body);

    // Build enhanced prompt using template system (unless manual mode)
    let enhancedPrompt = prompt;

    if (!isManualPrompt) {
      // Validate prompt options
      const validation = validatePromptOptions({
        basePrompt: prompt,
        subjectType,
        background,
        lighting,
        mood,
      });

      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid prompt configuration",
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      // Build enhanced prompt from templates
      enhancedPrompt = buildEnhancedPrompt({
        basePrompt: prompt,
        subjectType,
        background,
        lighting,
        mood,
        includeInstagramOptimization: true,
      });

      console.log("Enhanced prompt:", enhancedPrompt);
    }

    let dbPostId = postId;
    let referenceImageUrl: string | undefined;
    let referenceStorageKey: string | undefined;

    // Upload reference image to MinIO if provided
    if (referenceImage) {
      try {
        console.log("Processing reference image...");

        // Check if it's a base64 data URL
        if (referenceImage.startsWith("data:")) {
          // Extract base64 data and content type
          const matches = referenceImage.match(/^data:(.+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const contentType = matches[1];
            const base64Data = matches[2];

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(base64Data, "base64");

            // Upload to MinIO
            const uploadResult = await uploadImage(imageBuffer, contentType);
            referenceImageUrl = uploadResult.imageUrl;
            referenceStorageKey = uploadResult.storageKey;

            console.log("Reference image uploaded to MinIO:", referenceImageUrl);
          }
        } else {
          // If it's already a URL, use it directly (fallback)
          referenceImageUrl = referenceImage;
        }
      } catch (error) {
        console.error("Error uploading reference image:", error);
        // Don't fail the entire request if reference image upload fails
      }
    }

    // Create or update database record
    if (!dbPostId) {
      const [newPost] = await db
        .insert(generatedPosts)
        .values({
          prompt: enhancedPrompt, // Store enhanced prompt
          modelUsed: "bytedance/seedream-4",
          status: "generating",
          referenceImageUrl,
          referenceStorageKey,
        })
        .returning();

      dbPostId = newPost.id;
    } else {
      await db
        .update(generatedPosts)
        .set({
          status: "generating",
          referenceImageUrl,
          referenceStorageKey,
        })
        .where(eq(generatedPosts.id, dbPostId));
    }

    try {
      // Generate image with Replicate
      console.log("Generating image with prompt:", enhancedPrompt);
      // Use the MinIO URL if we uploaded it, otherwise use the original reference
      const replicateReferenceImage = referenceImageUrl || referenceImage;
      const { url: imageUrl, modelUsed } = await generateInstagramPost(
        enhancedPrompt,
        replicateReferenceImage,
        imagePromptStrength
      );

      console.log("Image generated successfully:", imageUrl);

      // Upload to MinIO
      console.log("Uploading to MinIO...");
      const { storageKey, imageUrl: minioUrl } = await uploadImageFromUrl(
        imageUrl
      );

      console.log("Uploaded to MinIO:", minioUrl);

      // Update database with success
      await db
        .update(generatedPosts)
        .set({
          imageUrl: minioUrl,
          storageKey,
          modelUsed,
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(generatedPosts.id, dbPostId));

      return NextResponse.json({
        success: true,
        postId: dbPostId,
        imageUrl: minioUrl,
        storageKey,
      });
    } catch (error) {
      console.error("Error during image generation:", error);

      // Update database with failure
      await db
        .update(generatedPosts)
        .set({
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(generatedPosts.id, dbPostId));

      throw error;
    }
  } catch (error) {
    console.error("Error in generate-image API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
