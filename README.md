# Saaral Cosmetics

Next.js storefront + admin panel wired to Supabase for products, orders, authentication, and exports.

## Environment setup

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase schema (required tables)

1. `products`
2. `orders`

Columns should match the interfaces in `src/lib/types.ts` and `src/lib/supabase/database.types.ts`.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

The production build output is placed in the `.next/` folder in the project root. **Do not export the app from any other folder** — all changes, source files, and configuration live in this repository root (not in git worktrees or sub-directories).

To preview the production build locally:

```bash
npm run start
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Vercel automatically runs `npm run build` and serves the `.next/` output — you do not need to upload any folder manually.

## Project structure

```
/                   ← repository root (make all changes here)
├── src/            ← all application source code
│   ├── app/        ← Next.js App Router pages
│   ├── components/ ← shared React components
│   └── lib/        ← Supabase client, types, utilities
├── public/         ← static assets
├── .env.local      ← local environment variables (not committed)
└── package.json    ← scripts: dev, build, start, lint
```

## App routes

1. Storefront: `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`
2. Order confirmation: `/order-confirmation/[id]`
3. Admin auth: `/admin`
4. Admin panel: `/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/products/new`, `/admin/export`
