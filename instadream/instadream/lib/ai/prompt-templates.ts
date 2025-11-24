/**
 * Comprehensive prompt template system for Seedream-4 image generation
 * Based on extensive research of Seedream-4 prompting best practices
 */

export type SubjectType =
  | 'portrait'
  | 'lifestyle'
  | 'product'
  | 'food'
  | 'landscape'
  | 'interior'
  | 'abstract'
  | 'fashion';

export type BackgroundType =
  | 'minimal_white'
  | 'natural_outdoor'
  | 'urban_city'
  | 'studio_setup'
  | 'indoor_cozy'
  | 'textured'
  | 'gradient'
  | 'bokeh';

export type LightingType =
  | 'golden_hour'
  | 'studio_lighting'
  | 'natural_window'
  | 'dramatic'
  | 'soft_diffused'
  | 'blue_hour'
  | 'backlit'
  | 'harsh_shadows';

export type MoodType =
  | 'warm_cozy'
  | 'energetic_vibrant'
  | 'luxurious_elegant'
  | 'calm_serene'
  | 'professional_clean'
  | 'playful_fun'
  | 'dark_moody'
  | 'bright_airy';

interface TemplateOption {
  value: string;
  label: string;
  emoji: string;
  keywords: string[];
  description: string;
}

/**
 * Subject Type Templates
 * Defines the main content type and composition style
 */
export const SUBJECT_TEMPLATES: Record<SubjectType, TemplateOption> = {
  portrait: {
    value: 'portrait',
    label: 'Portrait',
    emoji: '👤',
    keywords: [
      'portrait photography',
      'professional headshot',
      'eye contact',
      'facial expression',
      'shallow depth of field',
      'bokeh background',
    ],
    description: 'Professional portrait photography with focus on person',
  },
  lifestyle: {
    value: 'lifestyle',
    label: 'Lifestyle',
    emoji: '🌟',
    keywords: [
      'lifestyle photography',
      'candid moment',
      'authentic',
      'environmental context',
      'storytelling composition',
      'relatable',
    ],
    description: 'Candid lifestyle moments and authentic scenarios',
  },
  product: {
    value: 'product',
    label: 'Product',
    emoji: '📦',
    keywords: [
      'product photography',
      'commercial quality',
      'centered composition',
      'sharp details',
      'professional styling',
      'clean presentation',
    ],
    description: 'Professional product photography for e-commerce',
  },
  food: {
    value: 'food',
    label: 'Food',
    emoji: '🍽️',
    keywords: [
      'food photography',
      'appetizing',
      'beautifully plated',
      'detailed textures',
      'overhead shot',
      'culinary presentation',
    ],
    description: 'Delicious food photography with artistic plating',
  },
  landscape: {
    value: 'landscape',
    label: 'Landscape',
    emoji: '🌄',
    keywords: [
      'landscape photography',
      'wide angle',
      'breathtaking vista',
      'natural beauty',
      'foreground interest',
      'majestic',
    ],
    description: 'Stunning landscape and nature photography',
  },
  interior: {
    value: 'interior',
    label: 'Interior',
    emoji: '🏠',
    keywords: [
      'interior photography',
      'architectural',
      'spatial composition',
      'design aesthetic',
      'room styling',
      'modern space',
    ],
    description: 'Interior design and architectural photography',
  },
  abstract: {
    value: 'abstract',
    label: 'Abstract',
    emoji: '🎨',
    keywords: [
      'abstract art',
      'artistic composition',
      'creative vision',
      'conceptual',
      'dynamic forms',
      'modern art',
    ],
    description: 'Abstract and artistic creative imagery',
  },
  fashion: {
    value: 'fashion',
    label: 'Fashion',
    emoji: '👗',
    keywords: [
      'fashion photography',
      'editorial style',
      'haute couture',
      'stylish',
      'runway aesthetic',
      'designer clothing',
    ],
    description: 'High-fashion editorial photography',
  },
};

/**
 * Background/Setting Templates
 * Defines the environment and backdrop style
 */
export const BACKGROUND_TEMPLATES: Record<BackgroundType, TemplateOption> = {
  minimal_white: {
    value: 'minimal_white',
    label: 'Minimal White',
    emoji: '⚪',
    keywords: [
      'white background',
      'minimalist',
      'clean',
      'uncluttered',
      'negative space',
      'simple backdrop',
    ],
    description: 'Clean white minimal background for focus on subject',
  },
  natural_outdoor: {
    value: 'natural_outdoor',
    label: 'Natural Outdoor',
    emoji: '🌿',
    keywords: [
      'natural outdoor setting',
      'environmental context',
      'organic environment',
      'landscape background',
      'authentic location',
    ],
    description: 'Natural outdoor environment and scenery',
  },
  urban_city: {
    value: 'urban_city',
    label: 'Urban City',
    emoji: '🏙️',
    keywords: [
      'urban setting',
      'city background',
      'street photography aesthetic',
      'metropolitan',
      'architectural backdrop',
    ],
    description: 'Urban city environment with buildings and streets',
  },
  studio_setup: {
    value: 'studio_setup',
    label: 'Studio Setup',
    emoji: '📸',
    keywords: [
      'studio background',
      'professional setup',
      'controlled environment',
      'seamless backdrop',
      'photography studio',
    ],
    description: 'Professional photography studio environment',
  },
  indoor_cozy: {
    value: 'indoor_cozy',
    label: 'Indoor Cozy',
    emoji: '🛋️',
    keywords: [
      'cozy indoor setting',
      'warm interior',
      'comfortable space',
      'home environment',
      'inviting atmosphere',
    ],
    description: 'Warm and inviting indoor environment',
  },
  textured: {
    value: 'textured',
    label: 'Textured Surface',
    emoji: '🪵',
    keywords: [
      'textured background',
      'rustic surface',
      'wooden backdrop',
      'organic texture',
      'material detail',
    ],
    description: 'Textured surfaces like wood, concrete, or fabric',
  },
  gradient: {
    value: 'gradient',
    label: 'Gradient',
    emoji: '🌈',
    keywords: [
      'gradient background',
      'smooth color transition',
      'modern backdrop',
      'soft blend',
      'colorful gradient',
    ],
    description: 'Smooth gradient background with color transitions',
  },
  bokeh: {
    value: 'bokeh',
    label: 'Bokeh Blur',
    emoji: '✨',
    keywords: [
      'bokeh background',
      'out of focus',
      'shallow depth of field',
      'dreamy backdrop',
      'blurred lights',
    ],
    description: 'Beautiful bokeh blur effect in background',
  },
};

/**
 * Lighting Templates
 * Defines lighting style and conditions
 */
export const LIGHTING_TEMPLATES: Record<LightingType, TemplateOption> = {
  golden_hour: {
    value: 'golden_hour',
    label: 'Golden Hour',
    emoji: '🌅',
    keywords: [
      'golden hour lighting',
      'warm sunset glow',
      'soft golden light',
      'magic hour',
      'amber tones',
    ],
    description: 'Warm, soft lighting during golden hour (sunrise/sunset)',
  },
  studio_lighting: {
    value: 'studio_lighting',
    label: 'Studio Lighting',
    emoji: '💡',
    keywords: [
      'studio lighting',
      'professional setup',
      'controlled lighting',
      'even illumination',
      'soft shadows',
    ],
    description: 'Professional studio lighting setup',
  },
  natural_window: {
    value: 'natural_window',
    label: 'Natural Window Light',
    emoji: '🪟',
    keywords: [
      'natural window light',
      'soft diffused light',
      'indoor natural lighting',
      'gentle illumination',
      'window glow',
    ],
    description: 'Soft natural light coming through windows',
  },
  dramatic: {
    value: 'dramatic',
    label: 'Dramatic',
    emoji: '⚡',
    keywords: [
      'dramatic lighting',
      'high contrast',
      'bold shadows',
      'cinematic lighting',
      'intense illumination',
    ],
    description: 'High contrast dramatic lighting with strong shadows',
  },
  soft_diffused: {
    value: 'soft_diffused',
    label: 'Soft Diffused',
    emoji: '☁️',
    keywords: [
      'soft diffused lighting',
      'gentle illumination',
      'even light',
      'flattering light',
      'minimal shadows',
    ],
    description: 'Soft, even lighting with minimal harsh shadows',
  },
  blue_hour: {
    value: 'blue_hour',
    label: 'Blue Hour',
    emoji: '🌆',
    keywords: [
      'blue hour lighting',
      'twilight',
      'cool blue tones',
      'dusk atmosphere',
      'evening glow',
    ],
    description: 'Cool blue tones during twilight (blue hour)',
  },
  backlit: {
    value: 'backlit',
    label: 'Backlit',
    emoji: '🔆',
    keywords: [
      'backlit',
      'rim lighting',
      'silhouette effect',
      'glowing edges',
      'halo effect',
    ],
    description: 'Subject backlit with light source behind',
  },
  harsh_shadows: {
    value: 'harsh_shadows',
    label: 'Harsh Shadows',
    emoji: '🌞',
    keywords: [
      'harsh shadows',
      'strong directional light',
      'high contrast',
      'midday sun',
      'bold shadow patterns',
    ],
    description: 'Strong directional lighting with pronounced shadows',
  },
};

/**
 * Mood/Atmosphere Templates
 * Defines emotional tone and overall vibe
 */
export const MOOD_TEMPLATES: Record<MoodType, TemplateOption> = {
  warm_cozy: {
    value: 'warm_cozy',
    label: 'Warm & Cozy',
    emoji: '☕',
    keywords: [
      'warm atmosphere',
      'cozy mood',
      'inviting',
      'comfortable',
      'warm earthy tones',
      'homey feeling',
    ],
    description: 'Warm, inviting, and comfortable atmosphere',
  },
  energetic_vibrant: {
    value: 'energetic_vibrant',
    label: 'Energetic & Vibrant',
    emoji: '⚡',
    keywords: [
      'energetic mood',
      'vibrant colors',
      'dynamic composition',
      'lively atmosphere',
      'bold and exciting',
    ],
    description: 'High energy, vibrant, and dynamic feeling',
  },
  luxurious_elegant: {
    value: 'luxurious_elegant',
    label: 'Luxurious & Elegant',
    emoji: '💎',
    keywords: [
      'luxurious aesthetic',
      'elegant style',
      'sophisticated',
      'high-end',
      'refined atmosphere',
      'premium quality',
    ],
    description: 'Sophisticated, elegant, and luxurious vibe',
  },
  calm_serene: {
    value: 'calm_serene',
    label: 'Calm & Serene',
    emoji: '🧘',
    keywords: [
      'calm atmosphere',
      'serene mood',
      'peaceful',
      'tranquil',
      'relaxing vibe',
      'zen aesthetic',
    ],
    description: 'Peaceful, calm, and tranquil atmosphere',
  },
  professional_clean: {
    value: 'professional_clean',
    label: 'Professional & Clean',
    emoji: '💼',
    keywords: [
      'professional aesthetic',
      'clean composition',
      'corporate style',
      'polished',
      'business appropriate',
      'trustworthy',
    ],
    description: 'Clean, professional, and business-oriented',
  },
  playful_fun: {
    value: 'playful_fun',
    label: 'Playful & Fun',
    emoji: '🎉',
    keywords: [
      'playful mood',
      'fun atmosphere',
      'whimsical',
      'lighthearted',
      'joyful vibe',
      'cheerful',
    ],
    description: 'Fun, playful, and lighthearted feeling',
  },
  dark_moody: {
    value: 'dark_moody',
    label: 'Dark & Moody',
    emoji: '🌙',
    keywords: [
      'dark moody aesthetic',
      'atmospheric',
      'mysterious',
      'deep shadows',
      'dramatic mood',
      'intense atmosphere',
    ],
    description: 'Dark, moody, and atmospheric with deep tones',
  },
  bright_airy: {
    value: 'bright_airy',
    label: 'Bright & Airy',
    emoji: '☀️',
    keywords: [
      'bright and airy',
      'light and fresh',
      'clean aesthetic',
      'uplifting mood',
      'open atmosphere',
      'luminous',
    ],
    description: 'Bright, airy, and fresh with lots of light',
  },
};

/**
 * Quality modifiers that are always added for Instagram optimization
 */
export const INSTAGRAM_QUALITY_MODIFIERS = [
  'Instagram aesthetic',
  'mobile-optimized',
  'scroll-stopping',
  'professional quality',
  'sharp focus',
  'high resolution',
  '8k',
  'ultra detailed',
  'engaging composition',
];

/**
 * Quick-add modifiers for manual prompt mode
 */
export const QUICK_ADD_MODIFIERS = [
  { label: 'Golden Hour', value: 'golden hour lighting, warm glow' },
  { label: 'Professional Quality', value: 'professional quality, sharp focus, high resolution' },
  { label: 'Instagram Aesthetic', value: 'Instagram aesthetic, mobile-optimized, engaging' },
  { label: 'Cinematic', value: 'cinematic lighting, dramatic composition' },
  { label: 'Bokeh Background', value: 'shallow depth of field, bokeh background, blurred backdrop' },
  { label: 'Vibrant Colors', value: 'vibrant colors, saturated, bold palette' },
  { label: 'Minimalist', value: 'minimalist style, clean, simple, negative space' },
  { label: 'High Contrast', value: 'high contrast, dramatic lighting, bold shadows' },
  { label: 'Soft & Dreamy', value: 'soft diffused lighting, dreamy atmosphere, ethereal' },
  { label: 'Ultra Detailed', value: 'ultra detailed, 8k resolution, crisp, sharp' },
];
