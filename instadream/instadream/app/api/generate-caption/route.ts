import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { db } from '@/lib/db';
import { generatedPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const GenerateCaptionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  tone: z
    .enum(['professional', 'casual', 'funny', 'inspirational', 'educational'])
    .optional()
    .default('casual'),
  includeHashtags: z.boolean().optional().default(true),
  includeEmojis: z.boolean().optional().default(true),
  postId: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, tone, includeHashtags, includeEmojis, postId } =
      GenerateCaptionSchema.parse(body);

    // Build the system prompt based on preferences
    const systemPrompt = `You are an expert Instagram caption writer. Generate ONE single, ready-to-post Instagram caption.

CRITICAL RULES:
- Generate ONLY ONE caption, NOT multiple options
- Do NOT include phrases like "Option 1", "Here are some options", "You could use", etc.
- Output the caption directly without any preamble or explanation
- The caption should be ready to copy and paste directly to Instagram

Requirements:
- Tone: ${tone}
- ${includeEmojis ? 'Include 2-3 relevant emojis naturally within the text' : 'Do NOT include emojis'}
- ${includeHashtags ? 'Include 8-12 relevant hashtags on a new line at the end' : 'Do NOT include hashtags'}
- Keep the main caption concise (2-3 sentences max)
- Write in first person perspective
- Make it authentic and relatable
- Use line breaks for readability

Format:
[Main caption text with emojis if enabled]

[Hashtags if enabled, on a new line]

REMEMBER: Output ONLY the caption text, nothing else!`;

    // Generate caption with Gemini
    console.log('Generating caption with Gemini...');
    const { text: caption } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: `${systemPrompt}\n\nUser request: ${prompt}`,
      temperature: 0.8,
    });

    console.log('Caption generated successfully');

    // Update database if postId provided
    if (postId) {
      await db
        .update(generatedPosts)
        .set({
          caption,
          updatedAt: new Date(),
        })
        .where(eq(generatedPosts.id, postId));
    }

    return NextResponse.json({
      success: true,
      caption,
    });
  } catch (error) {
    console.error('Error in generate-caption API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate caption',
      },
      { status: 500 }
    );
  }
}
