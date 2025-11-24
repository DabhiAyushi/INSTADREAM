**TITLE:**
InstaDream - AI-Powered Instagram Content Generator

**DESCRIPTION:**
An AI-powered Instagram post generator that creates professional-quality images and captions using ByteDance's Seedream-4 and Google Gemini AI. Features template-based prompt building system with customizable subject types, backgrounds, lighting, and moods. Supports image-to-image generation with reference images, MinIO S3-compatible storage for generated content, and Instagram-style UI with hover previews of reference images. Includes generation history with download and delete capabilities.

**LINKS:**
Live Demo: https://instadream.splin.app

**TECH STACK:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- Backend: Next.js API Routes, PostgreSQL, Drizzle ORM
- AI/ML: ByteDance Seedream-4 (via Replicate API), Google Gemini 2.5 Flash
- Storage: MinIO S3-compatible object storage
- Other: Vercel AI SDK, Zod validation

**KEY FEATURES:**
- AI image generation with ByteDance Seedream-4 model
- Image-to-image generation with adjustable strength parameter
- Template-based prompt builder (4 subject types, 8 backgrounds, 8 lighting styles, 8 moods)
- Auto prompt and manual prompt modes
- AI-powered caption generation with tone matching
- Instagram-style UI with post cards and interactions
- Generation history with hover previews of reference images
- Download and delete functionality for posts
- Expandable captions with "show more/less" toggle
- MinIO storage for images and reference photos
- Real-time generation status tracking

**TECHNICAL CONTRIBUTIONS:**
- Built full-stack application with Next.js 15 App Router and server components
- Integrated ByteDance Seedream-4 via Replicate for AI image generation with image-to-image support
- Implemented intelligent prompt builder with 32 preset combinations and manual override
- Designed Instagram-style UI with post cards, like interactions, and expandable captions
- Set up MinIO S3-compatible storage for generated images and reference images
- Created generation history with hover previews showing original reference images
- Integrated Google Gemini 2.5 Flash for authentic, single-caption Instagram posts
- Fixed state timing bugs in sequential API calls for reliable caption-to-post linking
- Implemented delete functionality with MinIO cleanup and database cascade
- Built responsive UI with Tailwind CSS and Radix UI components
- Added database schema for tracking posts with reference images and generation metadata

