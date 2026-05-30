<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Image Optimization & Performance Rules

- **Format Constraint**: All images added or used in the project **MUST** be in optimized `AVIF` (preferred) or `WebP` formats. Do not use raw, uncompressed `PNG`, `JPG`, `JPEG`, or `GIF` files directly in components.
- **Conversion Utility**: If you need to add any PNG or JPG images, place them in `public/images` and run `npm run optimize-images` (which executes `node scripts/convert-images.js`). To automatically delete the original raw images after conversion, run `npm run optimize-images -- --delete`.
- **Cleanup**: After generating optimized versions, do not commit the raw PNG/JPG source files to Git unless they are specifically needed as high-quality archive originals.

- **Next.js `<Image>` Component**:
  - Always use Next.js's `<Image>` component (`next/image`) for automatic responsive scaling and format negotiation.
  - Ensure you specify correct `sizes` attributes (e.g., `(max-width: 768px) 100vw, 50vw`) to prevent mobile devices from downloading desktop-resolution images.
  - For above-the-fold LCP (Largest Contentful Paint) images, add the `priority` prop and `fetchPriority="high"`.
  - For below-the-fold images, keep `loading="lazy"` (default in Next.js).

