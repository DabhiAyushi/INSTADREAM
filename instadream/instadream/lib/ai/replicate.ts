import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// Popular models for Instagram post generation
export const MODELS = {
  SEEDREAM_4: 'bytedance/seedream-4',
  FLUX_PRO: 'black-forest-labs/flux-pro',
  FLUX_DEV: 'black-forest-labs/flux-dev',
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',
  SDXL: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
} as const;

export type ModelType = keyof typeof MODELS;

export interface GenerateImageOptions {
  prompt: string;
  model?: ModelType;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | '5:4';
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  referenceImage?: string; // URL or base64 for image-to-image
  imagePromptStrength?: number; // 0-1, how much to follow the reference image
}

export interface GeneratedImage {
  url: string;
  modelUsed: string;
}

/**
 * Generates an image using Replicate AI
 * @param options - Image generation options
 * @returns The generated image URL and model used
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  try {
    const {
      prompt,
      model = 'SEEDREAM_4', // Default to Seedream-4
      aspectRatio = '1:1',
      width,
      height,
      numOutputs = 1,
      guidanceScale = 7.5,
      numInferenceSteps = 50,
      referenceImage,
      imagePromptStrength = 0.5,
    } = options;

    const modelPath = MODELS[model];

    let input: any = {
      prompt,
    };

    // Model-specific configurations
    if (model === 'SEEDREAM_4') {
      // Seedream-4 configuration
      input.aspect_ratio = aspectRatio;
      input.enhance_prompt = true;
      input.max_images = numOutputs;

      // Add reference image for img2img (Seedream-4 uses image_input)
      if (referenceImage) {
        input.image_input = [referenceImage]; // Seedream-4 expects array of images
      }
    } else if (model.startsWith('FLUX')) {
      // FLUX models use aspect_ratio and num_outputs
      input.aspect_ratio = aspectRatio;
      input.num_outputs = numOutputs;

      // Add reference image for img2img (FLUX uses image parameter)
      if (referenceImage) {
        input.image = referenceImage;
        input.prompt_strength = imagePromptStrength;
      }

      // FLUX Pro and Dev support more parameters
      if (model === 'FLUX_PRO' || model === 'FLUX_DEV') {
        input.guidance_scale = guidanceScale;
        input.num_inference_steps = numInferenceSteps;
      }
    } else if (model === 'SDXL') {
      // SDXL uses width and height
      input.width = width || 1024;
      input.height = height || 1024;
      input.num_outputs = numOutputs;
      input.guidance_scale = guidanceScale;
      input.num_inference_steps = numInferenceSteps;

      // Add reference image for img2img
      if (referenceImage) {
        input.image = referenceImage;
        input.prompt_strength = imagePromptStrength;
      }
    }

    console.log('Generating image with Replicate:', { modelPath, input });

    const output = await replicate.run(modelPath, { input });

    // Handle different output formats
    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    return {
      url: imageUrl,
      modelUsed: modelPath,
    };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    throw error;
  }
}

/**
 * Generates an Instagram-optimized image using template-based prompts
 * @param prompt - The enhanced prompt (should be pre-built using prompt-builder)
 * @param referenceImage - Optional reference image URL for img2img
 * @param imagePromptStrength - How much to follow the reference image (0-1)
 * @returns The generated image URL and model used
 */
export async function generateInstagramPost(
  prompt: string,
  referenceImage?: string,
  imagePromptStrength?: number
): Promise<GeneratedImage> {
  return generateImage({
    prompt, // Prompt is already enhanced by prompt-builder
    model: 'SEEDREAM_4', // Seedream-4 for high quality Instagram posts
    aspectRatio: '1:1', // Square format perfect for Instagram
    referenceImage,
    imagePromptStrength,
  });
}

/**
 * Checks the status of a prediction
 * @param predictionId - The prediction ID to check
 * @returns The prediction status and output
 */
export async function getPredictionStatus(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    return prediction;
  } catch (error) {
    console.error('Error getting prediction status:', error);
    throw error;
  }
}
