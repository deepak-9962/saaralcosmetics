# Saaral Cosmetics

Next.js storefront + admin panel wired to Supabase for products, orders, authentication, and exports.

## Environment setup

Create a `.env.local` file in the project root:

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

App routes:

1. Storefront: `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`
2. Order confirmation: `/order-confirmation/[id]`
3. Admin auth: `/admin`
4. Admin panel: `/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/products/new`, `/admin/export`
