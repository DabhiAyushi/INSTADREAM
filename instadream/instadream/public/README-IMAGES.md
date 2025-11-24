# Image Assets Guide

This directory should contain your static image assets for SEO and branding.

## Required Images

### Favicons
- `favicon.ico` - Standard favicon (32x32 or 16x16)
- `apple-icon.png` - Apple touch icon (180x180)

### PWA Icons (for manifest.json)
- `icon-192.png` - 192x192 maskable icon
- `icon-512.png` - 512x512 maskable icon

### Open Graph / Social Media (Optional - if you prefer static images)
Instead of the dynamic image generators in app/, you can use static images:
- `opengraph-image.png` - 1200x630 for Open Graph
- `twitter-image.png` - 1200x630 for Twitter Cards

## Current Setup

✅ **Dynamic Image Generation** (app/opengraph-image.tsx, app/twitter-image.tsx)
- Automatically generates OG and Twitter images
- Customizable with React components
- No need for static images

## Image Specifications

### Favicon
- Size: 32x32 or 16x16 pixels
- Format: ICO or PNG
- File: `favicon.ico`

### Apple Touch Icon
- Size: 180x180 pixels
- Format: PNG
- File: `apple-icon.png`

### PWA Icons
- Sizes: 192x192 and 512x512 pixels
- Format: PNG
- Purpose: Maskable (with safe zone padding)
- Files: `icon-192.png`, `icon-512.png`

### Open Graph Images (if using static)
- Size: 1200x630 pixels
- Format: PNG or JPG
- Aspect ratio: 1.91:1
- Max file size: < 8MB

## Tools for Creating Icons

- **Favicon Generator**: https://favicon.io/
- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
- **Icon Resizer**: https://www.iloveimg.com/resize-image
- **Maskable Icon Editor**: https://maskable.app/

## Next.js Image Conventions

Next.js automatically picks up these special files from the app directory:
- `app/icon.png` or `app/icon.ico` - Favicon
- `app/apple-icon.png` - Apple touch icon
- `app/opengraph-image.png` - Open Graph image
- `app/twitter-image.png` - Twitter card image

Read more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
