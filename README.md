# Green Haven Nursery — Plant E-Commerce Website

A complete, production-ready nursery plants e-commerce website with WhatsApp ordering and an admin dashboard. Built with React, Vite, Tailwind CSS, and Supabase.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started (Development)](#getting-started-development)
5. [Creating an Admin Account](#creating-an-admin-account)
6. [Configuring WhatsApp Ordering](#configuring-whatsapp-ordering)
7. [API Documentation](#api-documentation)
8. [Deployment to Shared Hosting](#deployment-to-shared-hosting)
9. [Connecting Your Domain and SSL](#connecting-your-domain-and-ssl)
10. [Fallback: Static-Only Deployment](#fallback-static-only-deployment)
11. [Security Notes](#security-notes)

---

## Features

### Storefront
- **Home page** — Hero banner, trust badges, category showcase, featured products, about section
- **Shop page** — Search by name/SKU, filter by category, sort by price/name/date, responsive product grid
- **Product detail pages** — Image gallery, quantity selector, stock indicators, related products
- **Cart** — Slide-out cart drawer with quantity controls, persistent across page reloads (localStorage)
- **WhatsApp checkout** — Customer enters name, phone, address, PIN code; WhatsApp opens with a pre-formatted order message
- **About & Contact pages** — Store story, values, contact info, WhatsApp chat link
- **Out-of-stock labels** — Automatically shown when stock is 0

### Admin Dashboard (`/admin`)
- **Secure login** — Email/password authentication via Supabase Auth
- **Overview** — Product counts, stock status, order statistics, recent orders
- **Products manager** — Add, edit, delete, show/hide, feature products; search and filter by category
- **Categories manager** — Add, edit, delete categories with display ordering
- **Orders manager** — View order details, update order status (pending/confirmed/delivered/cancelled)
- **Settings** — Configure store name, WhatsApp number, delivery charge, currency, hero text, about text, contact info, social links

### Catalogue Limits
- Maximum **24 active products** enforced at the database level (PostgreSQL trigger)
- 5 categories: Indoor Plants, Flowering Plants, Fruit Plants, Outdoor Plants, Medicinal Plants

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Image hosting | Pexels (stock photos, loaded from CDN URLs) |

> **Note on shared hosting:** This app uses Supabase as its backend (PostgreSQL database + auth). This means you do NOT need a Node.js/Express backend or MySQL on your shared hosting — the frontend is a static build that talks directly to Supabase's hosted API. See the [Deployment](#deployment-to-shared-hosting) section for details.

---

## Project Structure

```
project/
├── src/
│   ├── components/          # Header, Footer, Layout, ProductCard, CartDrawer
│   ├── context/             # CartContext, SettingsContext, AdminContext
│   ├── lib/                 # supabase client, utility functions
│   ├── pages/               # Home, Shop, ProductDetail, Checkout, About, Contact
│   │   └── admin/           # AdminLogin, AdminDashboard, ProductsManager,
│   │                       # CategoriesManager, OrdersManager, SettingsManager
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Router + providers
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind + custom styles
├── supabase/
│   └── migrations/          # Database schema SQL
├── .env.example             # Environment variable template
├── tailwind.config.js       # Color system, fonts, animations
├── vite.config.ts           # Vite + path alias config
└── package.json
```

---

## Getting Started (Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment variables are pre-configured in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
   Output goes to `dist/` — these are the static files you upload to hosting.

---

## Creating an Admin Account

The admin dashboard is protected by Supabase Auth. To create your first admin:

### Option A: Using the Supabase Dashboard

1. Go to your Supabase project dashboard → **Authentication** → **Users**
2. Click **Add user** → enter email and password → **Create user**
3. Copy the user's UUID (shown in the user list)
4. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO admins (user_id, email)
   VALUES ('PASTE-USER-UUID-HERE', 'admin@yourstore.com');
   ```
5. Go to `https://yoursite.com/admin` and sign in with that email and password

### Option B: Using the Supabase SQL Editor (sign up + promote)

1. Run this in the Supabase SQL Editor to create the auth user and admin record together:
   ```sql
   -- Step 1: Create the auth user
   -- (Do this in Authentication > Users > Add user in the dashboard)
   
   -- Step 2: Add to admins table
   INSERT INTO admins (user_id, email)
   SELECT id, email FROM auth.users WHERE email = 'admin@yourstore.com';
   ```

### Security Notes
- Passwords are hashed by Supabase Auth (bcrypt) — never stored in plain text
- Only users listed in the `admins` table can access the dashboard
- All admin write operations (products, categories, settings, orders) are protected by Row Level Security policies that check `admins.user_id = auth.uid()`
- The 24-active-product limit is enforced by a PostgreSQL trigger — even an admin cannot exceed it

---

## Configuring WhatsApp Ordering

1. Sign in to the admin dashboard at `/admin`
2. Go to **Settings**
3. In the **WhatsApp Number** field, enter your business number:
   - Format: country code + number, no `+` or spaces
   - Example: `919876543210` for India (+91 98765 43210)
4. Set the **Delivery Charge** (or leave at 0 for free delivery)
5. Click **Save Settings**

### How ordering works:
1. Customer browses products and adds items to cart
2. Customer goes to checkout and fills in name, phone, address, PIN code
3. Customer clicks "Send Order via WhatsApp"
4. WhatsApp opens (web or app) with a pre-formatted message containing:
   - Order number and items with quantities and prices
   - Subtotal, delivery charge, and total
   - Customer name, phone, address, PIN code
5. The customer reviews the message and sends it to your business number
6. The order is also saved to the database (Orders tab in admin dashboard)

---

## API Documentation

This application uses Supabase's auto-generated REST API. The frontend communicates directly with Supabase using the anon key — no custom backend server is needed.

### Database Tables

| Table | Description |
|-------|-------------|
| `admins` | Maps Supabase auth users to admin role |
| `categories` | Plant categories (name, slug, description, display order) |
| `products` | Plant products (SKU, name, price, discount, stock, images, description, active, featured) |
| `site_settings` | Singleton (id=1) with store configuration |
| `orders` | Customer orders with items, totals, status |

### Public Read Endpoints (anon key)

```
GET /rest/v1/categories?order=display_order
GET /rest/v1/products?active=eq.true&select=*,category:categories(*)
GET /rest/v1/products?id=eq.{id}&select=*,category:categories(*)
GET /rest/v1/site_settings?id=eq.1
```

### Public Write Endpoints (anon key)

```
POST /rest/v1/orders
  Body: { customer_name, customer_phone, customer_address, customer_pincode, items, subtotal, delivery_charge, total, status }
```

### Admin-Only Endpoints (authenticated session)

```
GET    /rest/v1/products                 # Can see all products (including inactive)
POST   /rest/v1/products
PATCH  /rest/v1/products?id=eq.{id}
DELETE /rest/v1/products?id=eq.{id}

POST   /rest/v1/categories
PATCH  /rest/v1/categories?id=eq.{id}
DELETE /rest/v1/categories?id=eq.{id}

PATCH  /rest/v1/site_settings?id=eq.1

GET    /rest/v1/orders
PATCH  /rest/v1/orders?id=eq.{id}
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies:

- **Public (anon):** Can read active products, all categories, site settings. Can insert orders.
- **Authenticated admins:** Can read/write all products, categories, settings, and orders. Admin status is verified by checking `EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())`.

### Database Trigger

A `BEFORE INSERT OR UPDATE` trigger on `products` enforces the 24-active-product limit. If 24 products are already active, a new product cannot be set to active until another is deactivated.

---

## Deployment to Shared Hosting

Since this app uses Supabase as its backend, deployment is simpler than a traditional Node.js + MySQL setup — you only need to upload static files.

### Step 1: Build the frontend

```bash
npm run build
```

This produces a `dist/` folder with static HTML, CSS, and JS files.

### Step 2: Upload to your hosting account

1. Log in to your hosting control panel (cPanel, Plesk, etc.)
2. Open **File Manager**
3. Navigate to `public_html` (or your web root directory)
4. Upload all files from the `dist/` folder into `public_html`
5. If your hosting uses a subdirectory, upload there instead

### Step 3: Configure environment variables

The Supabase URL and anon key are **embedded in the build** (they are public, read-only keys — safe to include in frontend code). If you need to change them:

1. Edit `.env` with your Supabase project URL and anon key
2. Rebuild with `npm run build`
3. Re-upload the `dist/` files

> **Important:** The anon key is designed to be public. It only allows operations permitted by RLS policies. The service role key (which bypasses RLS) is never included in frontend code.

### Step 4: Create the MySQL/PostgreSQL database

This project uses Supabase (PostgreSQL), not MySQL. You do not need to create a database on your hosting provider.

- The database schema is already applied via Supabase migrations
- The database is hosted on Supabase's servers and accessed via HTTPS API calls
- No database configuration on your hosting is needed

### Step 5: Test

1. Visit your domain — the homepage should load with products
2. Add items to cart and go through the WhatsApp checkout flow
3. Visit `/admin` and sign in with your admin credentials
4. Verify you can add/edit products and change settings

---

## Connecting Your Domain and SSL

### Custom Domain

1. In your hosting control panel, go to **Domains** or **Addon Domains**
2. Add your domain (e.g., `greenhavennursery.com`)
3. Point the domain's document root to `public_html` (or wherever you uploaded the files)
4. Update your domain's DNS records:
   - **A record:** Point to your hosting server's IP
   - **CNAME record:** `www` → your domain
5. Wait for DNS propagation (can take up to 48 hours)

### SSL / HTTPS

1. In your hosting control panel, look for **SSL/TLS** or **Let's Encrypt**
2. Select your domain
3. Click **Install** or **Issue Certificate** (most hosts offer free Let's Encrypt SSL)
4. Enable **Force HTTPS Redirect** so all traffic goes through HTTPS
5. Verify by visiting `https://yourdomain.com`

### SPA Routing Note

This is a Single Page Application (SPA). If users navigate directly to a URL like `/shop` or `/admin`, the server needs to serve `index.html` for all routes. Add this to your `.htaccess` file in `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Without this, direct links to `/shop`, `/product/:id`, or `/admin` will show a 404 error.

---

## Fallback: Static-Only Deployment

If your hosting provider does not support Node.js, custom server configurations, or `.htaccess` files, this app still works because it is a **fully static build** that talks to Supabase's hosted API. You only need:

1. A web server that serves static HTML/CSS/JS files (every hosting provider supports this)
2. Internet access to Supabase's API (standard HTTPS requests)

No Node.js process, no MySQL database, no background workers are needed on your hosting.

### Hosting options that work:
- **cPanel / shared hosting** — Upload `dist/` to `public_html`
- **Netlify** — Drag and drop the `dist/` folder
- **Vercel** — Connect your repo, set build command to `npm run build`, output to `dist`
- **Cloudflare Pages** — Upload `dist/` or connect your repo
- **GitHub Pages** — Upload `dist/` contents to your repo

---

## Security Notes

- **Database credentials:** Supabase URL and anon key are in the frontend build. This is safe — the anon key only allows operations permitted by RLS policies. The service role key is never exposed.
- **Admin authentication:** Uses Supabase Auth with bcrypt-hashed passwords. Admin status is verified via the `admins` table on every request.
- **Row Level Security:** All tables have RLS enabled. Public users can only read active products and create orders. Admin operations require an authenticated session AND an entry in the `admins` table.
- **Input validation:** The checkout form validates name, phone (10 digits), address, and PIN code (6 digits) on the client side. Database constraints enforce data types.
- **24-product limit:** Enforced by a PostgreSQL trigger — cannot be bypassed by the frontend.
- **HTTPS:** Always enable SSL on your hosting. Supabase API calls are always over HTTPS.
- **No payment data:** Since orders go through WhatsApp, no payment card data is ever collected or stored.
