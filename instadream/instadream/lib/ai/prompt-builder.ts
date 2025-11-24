/**
 * Advanced prompt builder for merging user input with template selections
 * Optimized for Seedream-4 and Instagram content generation
 */

import {
  SUBJECT_TEMPLATES,
  BACKGROUND_TEMPLATES,
  LIGHTING_TEMPLATES,
  MOOD_TEMPLATES,
  INSTAGRAM_QUALITY_MODIFIERS,
  type SubjectType,
  type BackgroundType,
  type LightingType,
  type MoodType,
} from './prompt-templates';

export interface PromptBuilderOptions {
  basePrompt: string;
  subjectType?: SubjectType;
  background?: BackgroundType;
  lighting?: LightingType;
  mood?: MoodType;
  includeInstagramOptimization?: boolean;
  customModifiers?: string[];
}

/**
 * Builds a comprehensive prompt by merging base user input with template selections
 *
 * Optimal prompt structure for Seedream-4:
 * [SUBJECT TYPE] + [BASE USER PROMPT] + [BACKGROUND] + [LIGHTING] + [MOOD] + [QUALITY MODIFIERS]
 *
 * @param options - Prompt building configuration
 * @returns Enhanced, comma-separated prompt optimized for Seedream-4
 */
export function buildEnhancedPrompt(options: PromptBuilderOptions): string {
  const {
    basePrompt,
    subjectType,
    background,
    lighting,
    mood,
    includeInstagramOptimization = true,
    customModifiers = [],
  } = options;

  const parts: string[] = [];

  // 1. Subject Type Prefix (e.g., "Portrait photography", "Lifestyle photography")
  if (subjectType && SUBJECT_TEMPLATES[subjectType]) {
    const subjectTemplate = SUBJECT_TEMPLATES[subjectType];
    parts.push(...subjectTemplate.keywords.slice(0, 2)); // Use first 2 keywords for conciseness
  }

  // 2. Base User Prompt (core idea/description)
  if (basePrompt.trim()) {
    parts.push(basePrompt.trim());
  }

  // 3. Background/Setting
  if (background && BACKGROUND_TEMPLATES[background]) {
    const backgroundTemplate = BACKGROUND_TEMPLATES[background];
    parts.push(...backgroundTemplate.keywords);
  }

  // 4. Lighting
  if (lighting && LIGHTING_TEMPLATES[lighting]) {
    const lightingTemplate = LIGHTING_TEMPLATES[lighting];
    parts.push(...lightingTemplate.keywords);
  }

  // 5. Mood/Atmosphere
  if (mood && MOOD_TEMPLATES[mood]) {
    const moodTemplate = MOOD_TEMPLATES[mood];
    parts.push(...moodTemplate.keywords);
  }

  // 6. Custom Modifiers (if any)
  if (customModifiers.length > 0) {
    parts.push(...customModifiers);
  }

  // 7. Instagram Optimization & Quality Modifiers
  if (includeInstagramOptimization) {
    // Add selective quality modifiers (not all to avoid over-saturation)
    parts.push(
      'Instagram aesthetic',
      'professional quality',
      'sharp focus',
      'high resolution',
      'engaging composition'
    );
  }

  // Remove duplicates while preserving order
  const uniqueParts = Array.from(new Set(parts.filter(part => part.length > 0)));

  // Join with commas (Seedream-4 prompt format)
  return uniqueParts.join(', ');
}

/**
 * Builds a prompt preview for display to users
 * Shows how the final prompt will look before generation
 */
export function buildPromptPreview(options: PromptBuilderOptions): {
  enhancedPrompt: string;
  wordCount: number;
  hasAllSelections: boolean;
} {
  const enhancedPrompt = buildEnhancedPrompt(options);
  const wordCount = enhancedPrompt.split(/\s+/).length;
  const hasAllSelections = !!(
    options.basePrompt &&
    options.subjectType &&
    options.background &&
    options.lighting &&
    options.mood
  );

  return {
    enhancedPrompt,
    wordCount,
    hasAllSelections,
  };
}

/**
 * Validates prompt builder options
 * Ensures minimum requirements are met
 */
export function validatePromptOptions(options: PromptBuilderOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.basePrompt || options.basePrompt.trim().length < 3) {
    errors.push('Base prompt must be at least 3 characters');
  }

  if (options.basePrompt && options.basePrompt.length > 500) {
    errors.push('Base prompt is too long (max 500 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get template display information for UI rendering
 */
export function getTemplateInfo() {
  return {
    subjects: Object.entries(SUBJECT_TEMPLATES).map(([key, template]) => ({
      value: key,
      label: template.label,
      emoji: template.emoji,
      description: template.description,
    })),
    backgrounds: Object.entries(BACKGROUND_TEMPLATES).map(([key, template]) => ({
      value: key,
      label: template.label,
      emoji: template.emoji,
      description: template.description,
    })),
    lighting: Object.entries(LIGHTING_TEMPLATES).map(([key, template]) => ({
      value: key,
      label: template.label,
      emoji: template.emoji,
      description: template.description,
    })),
    moods: Object.entries(MOOD_TEMPLATES).map(([key, template]) => ({
      value: key,
      label: template.label,
      emoji: template.emoji,
      description: template.description,
    })),
  };
}
