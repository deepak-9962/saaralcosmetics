# Product Requirements Document
## Saaral Cosmetics — E-Commerce Website

**Version:** 1.0  
**Date:** May 2026  
**Project Type:** Small Business E-Commerce (Cosmetics)  
**Team:** 2-person development team  
**Tools:** Cursor + Claude (AI-assisted development)

---

## 1. Project Overview

Saaral Cosmetics is a small Indian cosmetics startup selling natural skincare and personal care products. This document defines all requirements to build a modern, premium e-commerce website from scratch — covering the customer-facing storefront and a private admin dashboard for the business owner.

### 1.1 Goals

- Sell 12 products online with a smooth, mobile-first shopping experience
- Accept payments via Razorpay (UPI, cards, net banking)
- Allow guest checkout without account creation
- Give the owner a simple dashboard to manage products, view orders, and export data
- Present the brand with a premium, trustworthy cosmetics aesthetic

### 1.2 Non-Goals (V1)

- Customer accounts / login / order history
- Discount codes or coupons
- Blog or content management
- Inventory alerts or low-stock automation
- Courier/shipping API integration
- Customer reviews
- Analytics dashboard

---

## 2. Users & Personas

### 2.1 Customer (Primary User)
- Indian women aged 18–45
- Mobile-first (likely browsing on Android/iPhone)
- Expects a clean, beautiful UI similar to D2C brands
- Wants to checkout quickly without creating an account
- Will pay via UPI, cards, or net banking

### 2.2 Store Owner (Admin User)
- Single person managing the business
- Non-technical; needs a simple, clean dashboard
- Needs to: add/edit products, view orders, update order status, export customer data
- Will access admin from desktop or mobile

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SEO, SSR/SSG, performance |
| Styling | Tailwind CSS | Rapid, responsive, utility-first |
| UI Components | shadcn/ui | Clean, accessible, customizable |
| Animations | Framer Motion | Premium feel, smooth transitions |
| Backend & DB | Supabase | PostgreSQL + Storage + Auth + APIs |
| Payments | Razorpay | India-first, UPI + cards + net banking |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) | Free tier, scalable |

---

## 4. Product Catalog

| Category | Product | Variants |
|---|---|---|
| Face Cream | Face Cream | 2 variants |
| Face Wash | Face Wash | 2 variants |
| Soap | Soap | 6 variants |
| Nalangu Maavu Powder | Nalangu Maavu Powder | 2 variants |
| **Total** | **4 products** | **12 SKUs** |

Each product variant is treated as a separate SKU with its own price, stock, and images.

---

## 5. Database Schema

### 5.1 `products` Table

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text NOT NULL
slug            text UNIQUE NOT NULL
category        text NOT NULL  -- 'face-cream' | 'face-wash' | 'soap' | 'nalangu-maavu'
variant_name    text           -- e.g. '50g', '100g', 'Rose', 'Turmeric'
price           numeric(10,2) NOT NULL
compare_price   numeric(10,2)  -- original price for strikethrough display
description     text
ingredients     text
how_to_use      text
images          text[]         -- Array of Supabase Storage URLs
stock           integer DEFAULT 0
is_active       boolean DEFAULT true
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### 5.2 `orders` Table

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_number    text UNIQUE NOT NULL    -- e.g. 'SC-20260001'
-- Customer Info
customer_name   text NOT NULL
customer_phone  text NOT NULL
customer_email  text
-- Shipping Address
address_line1   text NOT NULL
address_line2   text
city            text NOT NULL
state           text NOT NULL
pincode         text NOT NULL
-- Order Details
items           jsonb NOT NULL          -- [{product_id, name, variant, qty, price}]
subtotal        numeric(10,2) NOT NULL
shipping_charge numeric(10,2) DEFAULT 0
total           numeric(10,2) NOT NULL
-- Payment
payment_status  text DEFAULT 'pending'  -- 'pending' | 'paid' | 'failed'
razorpay_order_id   text
razorpay_payment_id text
-- Fulfillment
order_status    text DEFAULT 'new'      -- 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
notes           text                    -- internal notes by owner
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### 5.3 `admin_users` Table
Handled entirely by **Supabase Auth** — single owner account, email + password login.

---

## 6. Site Architecture

```
/                          → Home
/products                  → All Products (with category filter)
/products/[slug]           → Product Detail Page
/cart                      → Cart Page
/checkout                  → Checkout Form + Payment
/order-confirmation/[id]   → Order Success Page
/contact                   → Contact / About Page

/admin                     → Admin Login (redirect if not authed)
/admin/dashboard           → Overview stats
/admin/orders              → Orders list + detail view
/admin/products            → Products list
/admin/products/new        → Add product
/admin/products/[id]/edit  → Edit product
/admin/export              → Export CSV/Excel
```

---

## 7. Page-by-Page Requirements

---

### 7.1 Home Page (`/`)

**Purpose:** First impression. Build trust, show the brand, drive product discovery.

**Sections:**

1. **Hero Section**
   - Full-width background (image or soft gradient)
   - Brand name + tagline (e.g. "Pure. Natural. You.")
   - CTA button → `/products`
   - Subtle Framer Motion entrance animation

2. **Category Strip**
   - 4 category cards: Face Cream, Face Wash, Soap, Nalangu Maavu
   - Each links to `/products?category=...`
   - Soft hover animation

3. **Featured Products**
   - Show 4–6 bestsellers (manually curated via `is_featured` field or admin toggle)
   - Product card: image, name, variant, price, "Add to Cart" button

4. **Brand Story / About Block**
   - Short paragraph about Saaral's values (natural, handmade, trusted)
   - Optional: 2–3 ingredient highlight icons

5. **WhatsApp Sticky Button**
   - Fixed bottom-right on all pages
   - Opens WhatsApp chat with pre-filled message

6. **Footer**
   - Logo, short tagline
   - Navigation links
   - WhatsApp link + Email
   - Copyright

---

### 7.2 Products Page (`/products`)

**Purpose:** Browse and discover all products.

**Features:**
- Category filter tabs (All / Face Cream / Face Wash / Soap / Nalangu Maavu)
- Product grid — 2 columns on mobile, 3–4 on desktop
- Each product card shows:
  - Product image (hover shows second image if available)
  - Name + variant name
  - Price (with compare_price strikethrough if set)
  - "Add to Cart" button
- Smooth filter animation via Framer Motion
- No pagination needed (only 12 SKUs)

---

### 7.3 Product Detail Page (`/products/[slug]`)

**Purpose:** Convince the customer to buy.

**Sections:**
1. **Image Gallery**
   - Main image + thumbnail strip
   - Mobile: swipeable carousel

2. **Product Info**
   - Name, variant name
   - Price (and compare price)
   - Short description
   - "Add to Cart" CTA (prominent, full-width on mobile)

3. **Tabs / Accordion**
   - Description
   - Ingredients
   - How to Use

4. **Related Products**
   - 3–4 products from the same category

---

### 7.4 Cart Page (`/cart`)

**Purpose:** Review items before checkout.

**Features:**
- List of cart items: image, name, variant, qty stepper, price
- Remove item button
- Order subtotal
- "Proceed to Checkout" CTA
- "Continue Shopping" link
- Cart state stored in **localStorage** (no login required)
- Cart item count badge on nav icon

---

### 7.5 Checkout Page (`/checkout`)

**Purpose:** Collect customer info and complete payment.

**Form Fields:**
- Full Name *
- Phone Number * (10-digit Indian mobile)
- Email (optional)
- Address Line 1 *
- Address Line 2
- City *
- State * (dropdown of Indian states)
- Pincode *

**Order Summary Sidebar (desktop) / Collapsed Section (mobile):**
- Items list, subtotal, shipping, total

**Payment:**
- "Pay Now" button triggers Razorpay checkout modal
- Razorpay Order created via Supabase Edge Function before opening modal
- On payment success → verify signature server-side → update order status to `paid` → redirect to confirmation page

**Validation:**
- All required fields validated client-side before payment
- Phone number format validation

---

### 7.6 Order Confirmation Page (`/order-confirmation/[id]`)

**Purpose:** Reassure customer that order is placed.

**Content:**
- Success animation (Framer Motion checkmark)
- Order number
- Summary of items ordered
- Delivery address
- "We'll contact you on WhatsApp for shipping updates" message
- WhatsApp button to chat with owner
- "Continue Shopping" link

---

### 7.7 Contact Page (`/contact`)

**Purpose:** Build trust, provide easy support access.

**Sections:**
1. **WhatsApp CTA**
   - Large button: "Chat with us on WhatsApp"
   - Opens wa.me link with pre-filled message

2. **Email**
   - Displayed email address (mailto link)

3. **About Saaral**
   - Short brand story paragraph
   - Values: natural ingredients, handcrafted, cruelty-free (as applicable)

---

## 8. Admin Panel Requirements

**Access:** Single owner. Protected by Supabase Auth (email + password). Session stored in Next.js middleware — all `/admin/*` routes redirect to `/admin` login if not authenticated.

---

### 8.1 Admin Login (`/admin`)

- Email + password form
- Login via Supabase Auth
- On success → redirect to `/admin/dashboard`

---

### 8.2 Dashboard (`/admin/dashboard`)

**Stats Cards:**
- Total orders (all time)
- Orders today
- Revenue today
- Pending orders (new + processing)

**Recent Orders Table:**
- Last 10 orders
- Columns: Order #, Customer Name, Total, Payment Status, Order Status, Date
- Click row → order detail modal or page

---

### 8.3 Orders Page (`/admin/orders`)

**Features:**
- Table of all orders, newest first
- Columns: Order #, Customer, Phone, Items (count), Total, Payment Status, Order Status, Date
- Filter by order status (All / New / Processing / Shipped / Delivered / Cancelled)
- Filter by payment status (All / Paid / Pending / Failed)
- Click row to open order detail view
- Order detail shows: full customer info, address, items ordered, payment info, internal notes field
- Owner can update `order_status` from the detail view (dropdown)
- Owner can add internal notes

---

### 8.4 Products Page (`/admin/products`)

**Features:**
- Table of all products/variants
- Columns: Image, Name, Variant, Category, Price, Stock, Active
- Toggle `is_active` on/off inline
- "Add Product" button → `/admin/products/new`
- Edit button per row → `/admin/products/[id]/edit`

---

### 8.5 Add / Edit Product

**Form Fields:**
- Name
- Category (dropdown)
- Variant name (e.g. "50g Rose")
- Price
- Compare Price (optional)
- Description (rich text or textarea)
- Ingredients (textarea)
- How to Use (textarea)
- Images (upload up to 4, stored in Supabase Storage)
- Stock quantity
- Is Active (toggle)

**Behavior:**
- Images uploaded to Supabase Storage bucket `product-images`
- Public URLs stored as array in `products.images`
- Slug auto-generated from name + variant on create (editable)

---

### 8.6 Export Page (`/admin/export`)

**Export Options:**
- Export all orders as CSV
- Export orders by date range as CSV
- Export customer contact list (name, phone, email, city) as CSV

**Implementation:** Generate CSV client-side from Supabase query result using a library like `papaparse`. "Download Excel" option using `xlsx` library.

---

## 9. Payment Integration — Razorpay

### Flow

```
1. Customer fills checkout form → clicks "Pay Now"
2. Frontend calls POST /api/create-order (Supabase Edge Function)
   → Creates order record in DB with status 'pending'
   → Creates Razorpay order via Razorpay API
   → Returns { razorpay_order_id, amount, currency }
3. Frontend opens Razorpay checkout modal
4. Customer pays → Razorpay sends payment_id, signature to frontend
5. Frontend calls POST /api/verify-payment (Supabase Edge Function)
   → Verifies HMAC signature using Razorpay secret
   → Updates order: payment_status = 'paid', order_status = 'new'
   → Returns { order_id }
6. Frontend redirects to /order-confirmation/[order_id]
```

### On Payment Failure
- Order record stays with `payment_status = 'failed'`
- User shown error message with option to retry
- Retry creates a new Razorpay order (same DB order record updated)

### Razorpay Config
- `key_id` stored in `.env.local` (client-safe)
- `key_secret` stored only in Supabase Edge Function secrets (never exposed to frontend)

---

## 10. Design System

### 10.1 Design Philosophy
Premium, clean, minimal. Inspired by modern Indian D2C skincare brands. Evokes trust, purity, and naturalness. Not clinical, not overly "techy".

### 10.2 Typography

| Use | Font | Weight |
|---|---|---|
| Headlines | Cormorant Garamond or Playfair Display | 400–600 |
| Body | Inter or DM Sans | 400 |
| Labels / Buttons | DM Sans | 500–600 |

Load via `next/font` for performance.

### 10.3 Colour Palette (Suggested — to be refined with brand)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#C9A96E` (warm gold) | CTAs, accents |
| `background` | `#FDFAF6` (off-white cream) | Page background |
| `surface` | `#FFFFFF` | Cards |
| `text-primary` | `#1A1A1A` | Body text |
| `text-muted` | `#6B6B6B` | Subtext, labels |
| `border` | `#EBEBEB` | Card borders, dividers |
| `success` | `#4CAF50` | Order success |
| `error` | `#E53935` | Errors |

### 10.4 Spacing & Layout
- Base unit: 4px
- Max content width: 1280px
- Section vertical padding: 80px desktop / 48px mobile
- Card border-radius: 12px
- Button border-radius: 8px

### 10.5 Animation Principles (Framer Motion)
- Entrance: `fadeInUp` with `duration: 0.4, ease: easeOut`
- Stagger product grids with `staggerChildren: 0.08`
- Page transitions: subtle fade, 0.2s
- No flashy or distracting animations — motion supports the premium feel, not overshadow it

---

## 11. Responsive Design

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, large touch targets, sticky CTA |
| Tablet | 640–1024px | 2-col product grid |
| Desktop | > 1024px | 3–4 col grid, side-by-side checkout |

Mobile-first approach. All components designed for mobile before scaling up.

---

## 12. SEO Requirements

- Next.js `generateMetadata()` for dynamic page titles and descriptions
- OG tags for product pages (image, title, description)
- Sitemap auto-generated via `next-sitemap`
- Structured data (JSON-LD) for products (name, price, availability)
- Clean URL slugs (e.g. `/products/rose-soap-100g`)
- Fast Core Web Vitals: images via `next/image` with lazy loading, fonts via `next/font`

---

## 13. Security & Compliance

- Admin routes protected by Supabase Auth middleware
- Razorpay `key_secret` never exposed to frontend — all signature verification in Edge Functions
- Supabase Row Level Security (RLS) enabled:
  - `products`: public read, admin-only write
  - `orders`: insert allowed (for checkout), admin-only read/update
- Input sanitisation on all form fields
- HTTPS enforced (Vercel default)
- No sensitive customer data stored beyond what's needed for order fulfilment

---

## 14. WhatsApp Integration

- **Sticky floating button** on all public pages (bottom-right)
- Links to `https://wa.me/91XXXXXXXXXX?text=Hi, I have a question about Saaral Cosmetics`
- On order confirmation page, a more specific message: `Hi, I just placed order #SC-XXXX. Please confirm my order.`
- Contact page has a prominent WhatsApp CTA section

---

## 15. Development Phases

### Phase 1 — Foundation (Days 1–3)
- [ ] Next.js project setup with Tailwind, shadcn/ui, Framer Motion
- [ ] Supabase project setup: tables, RLS policies, Storage bucket
- [ ] Design system: colours, typography, base components
- [ ] Layout: Navbar, Footer, WhatsApp button

### Phase 2 — Customer Storefront (Days 4–7)
- [ ] Home page (hero, categories, featured products)
- [ ] Products listing page with category filter
- [ ] Product detail page
- [ ] Cart (localStorage-based)
- [ ] Contact page

### Phase 3 — Checkout & Payments (Days 8–10)
- [ ] Checkout form with validation
- [ ] Supabase Edge Functions: `create-order`, `verify-payment`
- [ ] Razorpay integration (test mode first)
- [ ] Order confirmation page
- [ ] End-to-end payment flow testing

### Phase 4 — Admin Panel (Days 11–14)
- [ ] Admin login with Supabase Auth
- [ ] Dashboard with stats
- [ ] Orders list + detail + status update
- [ ] Products CRUD with image upload
- [ ] CSV/Excel export

### Phase 5 — Polish & Launch (Days 14–16)
- [ ] SEO metadata on all pages
- [ ] Sitemap generation
- [ ] Mobile responsiveness audit
- [ ] Performance optimisation (images, fonts)
- [ ] Razorpay switch to live mode
- [ ] Deploy to Vercel + Supabase Cloud
- [ ] Domain setup and DNS

---

## 16. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Edge Functions only, never client

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=         # Edge Functions only, never client

# Business Config
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_BUSINESS_EMAIL=hello@saaralcosmetics.com
```

---

## 17. Estimated Costs

| Item | Cost |
|---|---|
| Domain (saaralcosmetics.com or .in) | ₹800–₹1,200/year |
| Vercel Hosting | Free (Hobby) |
| Supabase Cloud | Free tier (initially) |
| Razorpay Transaction Fee | ~2% per transaction |
| **Development (your charge)** | **₹15,000–₹18,000** |

---

## 18. Future Scope (V2+)

- Customer accounts + order history
- Discount codes & offers
- Product reviews
- Blog / CMS integration
- Inventory alerts (low stock notifications)
- Analytics (Google Analytics or PostHog)
- Wishlist
- Loyalty points

---

## 19. Open Questions / Decisions Needed Before Dev Starts

| # | Question | Impact |
|---|---|---|
| 1 | What is the WhatsApp business number? | WhatsApp integration |
| 2 | What is the business email address? | Contact page, footer |
| 3 | What are the shipping charges (flat rate or free above X)? | Checkout total calculation |
| 4 | Are all 12 products available from day 1, or phased? | Initial product seed data |
| 5 | Does the owner have product photos ready? | Product images in Supabase |
| 6 | Preferred colour palette / logo ready? | Design system finalisation |
| 7 | Razorpay account created and KYC done? | Payment go-live readiness |

---

*Document prepared for Saaral Cosmetics website development — May 2026*
