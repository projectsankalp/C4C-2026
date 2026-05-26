# HastKala API

Backend API for Person 4: WhatsApp submissions, AI listing fallback, Karigar Sakhi approval, public products, orders, WhatsApp alerts, and impact stats.

## Run Locally

```bash
npm install
npm run dev
```

Base URL:

```text
http://localhost:5000/api
```

When `DATABASE_URL` is set, the API uses the Supabase Postgres database. If `DATABASE_URL` is missing or `USE_MEMORY_STORE=true`, it falls back to an in-memory seeded store so teammates can still integrate locally.

## Endpoints

```text
GET    /health
GET    /products
GET    /products/:id
POST   /products/draft
POST   /orders
GET    /orders/:id
POST   /artisans/find-or-create
GET    /artisans/:id
GET    /vendor/products/pending
PATCH  /vendor/products/:id
PATCH  /vendor/products/:id/approve
PATCH  /vendor/products/:id/reject
GET    /vendor/orders
PATCH  /vendor/orders/:id/status
GET    /vendor/artisans
PATCH  /vendor/artisans/:id/verify
GET    /vendor/stats
GET    /impact
POST   /whatsapp/inbound
POST   /whatsapp/upload-image
POST   /demo/reset
```

## Curl Examples

```bash
curl http://localhost:5000/api/health
```

```bash
curl http://localhost:5000/api/products
```

```bash
curl -X POST http://localhost:5000/api/products/draft \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "artisanName": "Lakshmi",
    "message": "Handmade coconut shell lamp, 600 rupees, 2 pieces available",
    "imageUrl": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
    "district": "Dakshina Kannada",
    "language": "kn",
    "craftType": "Coconut Shell Craft"
  }'
```

```bash
curl http://localhost:5000/api/vendor/products/pending
```

```bash
curl -X PATCH http://localhost:5000/api/vendor/products/PRODUCT_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reviewerName": "Karigar Sakhi",
    "comment": "Verified and approved"
  }'
```

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_lamp",
    "buyerName": "Rahul",
    "buyerPhone": "9999999999",
    "buyerAddress": "Bengaluru, Karnataka",
    "quantity": 1,
    "notes": "Please pack safely."
  }'
```

```bash
curl -X POST http://localhost:5000/api/demo/reset \
  -H "x-demo-api-key: hastkala-demo-key"
```

## Supabase Database

Project ref:

```text
zbjxkiqqxdsybnrzjkpv
```

Required local environment:

```env
DATABASE_URL=postgresql://postgres:YOUR_DATABASE_PASSWORD@db.zbjxkiqqxdsybnrzjkpv.supabase.co:5432/postgres
DEMO_API_KEY=hastkala-demo-key
```

The live database has RLS enabled on all Person 4 tables. Public clients can read only approved products, verified artisans, and impact metrics. Backend write operations should run with the server-side database connection.

## Frontend Environment

```env
VITE_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Demo Notes

WhatsApp alert failures do not fail order creation. If `WA_BOT_URL` is unset, alerts are logged and skipped.
