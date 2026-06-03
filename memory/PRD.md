# Ecoandes — Premium BIO E-commerce

## Problem Statement (verbatim)
Develop the new Ecoandes platform (https://productosecoandes.com/) with B2C retail + B2B professional sales, admin dashboard, Excel-based massive price import, Stripe+PayPal payments, Cloudinary media, Resend transactional emails, Natural Luxury UI inspired by penelope-care.com. Preserve SEO via /producto/[slug] URLs.

## Stack
- Backend: FastAPI (Python) + Motor (MongoDB async)
- Frontend: React 19 + Tailwind + shadcn/ui + framer-motion + sonner
- Payments: Stripe (emergentintegrations) + PayPal REST API (sandbox)
- Media: Cloudinary signed upload
- Email: Resend
- Auth: JWT + bcrypt

## Personas
- Shopper (Retail B2C) — guest checkout or optional account
- Profesional (B2B) — logs in to see special pricing, uses CIF/NIF
- Administrador (dueña) — manages catalog, orders, customers, price imports

## Implemented (Feb 2026)
- WordPress XML importer seeded 187 products across 20+ categories with variations (auto on startup)
- Product catalog with dual pricing (retail/PVP vs professional/B2B)
- Public: Home, Shop (filters + search + cat chips), PDP `/producto/[slug]`, About, Contact, Pro (B2B)
- Side-drawer cart (framer-motion) with free shipping progress bar (60 € threshold)
- Checkout (guest + logged-in) with dynamic shipping calc + server-side price recompute to prevent tampering
- Payment: Stripe (test key `sk_test_emergent`), PayPal (sandbox, needs keys)
- Admin Dashboard: metrics, recent orders, orders list+filters, order detail w/ status update, customers list+role change, products list+edit modal, Excel price import (SKU match, variation-aware, logs)
- JWT auth (login/register/me), admin auto-seeded (admin@ecoandes.com / Admin123!)
- Resend order confirmation email on order creation (needs RESEND_API_KEY)
- Cloudinary signed upload endpoint (needs keys)

## Environment keys to provide in /app/backend/.env (already scaffolded)
- STRIPE_API_KEY (default sk_test_emergent works)
- PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_MODE (sandbox|live)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- RESEND_API_KEY, SENDER_EMAIL, ADMIN_NOTIFICATION_EMAIL

## Test Credentials
- Admin: admin@ecoandes.com / Admin123!
- Retail: retail@ecoandes.com / Retail123! (created during smoke test)

## Backlog (P1)
- Admin create-product flow with Cloudinary upload widget
- Order email template branding + logo
- Profesional account approval workflow (pending → approved)
- Webhook-triggered email dispatch (instead of background task on order creation)
- Invoice PDF generation & download

## Backlog (P2)
- Stock management with variation-level inventory
- Discount codes / coupons
- Multilingual (ES/EN)
- Hostinger deploy docs + GitHub Actions workflow
