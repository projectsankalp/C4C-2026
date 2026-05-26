# Karigar Backend Architecture & Database Specification

This document details the backend architecture for **Karigar**, utilizing **Node.js** and **Supabase (PostgreSQL, Storage, and Auth)**. The design is optimized for low-latency retrieval, secure direct communications, storage of audio descriptions, and mobile-friendly access.

---

## 1. Relational Database Schema (Supabase / PostgreSQL)

Below is the database design with Row Level Security (RLS) enabled. Tables are optimized for relational integrity and quick queries on artisan catalogs.

### `profiles` (Artisans)
Stores the profile information of the registered rural women artisans.
```sql
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    phone_number text not null, -- Format: +91XXXXXXXXXX (for direct WhatsApp redirect)
    village text not null,
    district text not null,
    state text not null,
    languages text[] default '{}'::text[] not null, -- e.g., {'Hindi', 'Marathi'}
    story_text text,
    story_audio_url text, -- Supabase Storage URL
    profile_pic_url text, -- Supabase Storage URL
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles
    for select using (true);

create policy "Users can update their own profile." on public.profiles
    for update using (auth.uid() = id);
```

### `products` (Artisan Products)
Stores individual products uploaded by artisans. Includes audio support for voice descriptions.
```sql
create table public.products (
    id uuid default gen_random_uuid() primary key,
    artisan_id uuid references public.profiles(id) on delete cascade not null,
    title jsonb not null, -- Multilingual titles: {"en": "Handwoven Saree", "hi": "हथकरघा साड़ी"}
    description jsonb,   -- Multilingual text description: {"en": "...", "hi": "..."}
    description_audio_url text, -- URL to recorded audio file (e.g., .mp3/.webm)
    audio_duration_seconds integer default 0,
    price numeric(10, 2), -- Nullable for negotiable/price-upon-request items
    category_slug text references public.categories(slug) on delete set null,
    image_urls text[] default '{}'::text[] not null, -- Array of product images
    is_available boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for rapid queries
create index idx_products_artisan_id on public.products(artisan_id);
create index idx_products_category on public.products(category_slug);

-- Enable RLS
alter table public.products enable row level security;

-- Policies
create policy "Public products are viewable by everyone." on public.products
    for select using (true);

create policy "Artisans can insert their own products." on public.products
    for insert with check (auth.uid() = artisan_id);

create policy "Artisans can update their own products." on public.products
    for update using (auth.uid() = artisan_id);

create policy "Artisans can delete their own products." on public.products
    for delete using (auth.uid() = artisan_id);
```

### `categories` (Product Categories)
Pre-populated listing of craft categories (e.g., Pottery, Textiles, Jewelry).
```sql
create table public.categories (
    slug text primary key,
    name jsonb not null, -- Multilingual: {"en": "Pottery", "hi": "मिट्टी के बर्तन"}
    icon_name text, -- Reference key to frontend icon libraries
    display_order integer default 0 not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
create policy "Categories are viewable by everyone." on public.categories
    for select using (true);
```

---

## 2. Storage Buckets Structure
Supabase Storage is utilized for assets. Files must be organized with proper folder hierarchies:

1.  **`artisan-assets`** (Public)
    *   Path: `profiles/{artisan_id}/avatar.jpg`
    *   Path: `profiles/{artisan_id}/story_audio.webm`
2.  **`product-assets`** (Public)
    *   Path: `products/{artisan_id}/{product_id}/image_0.jpg`
    *   Path: `products/{artisan_id}/{product_id}/description_audio.webm`

---

## 3. Node.js Middleware / Helper Backend
While Supabase provides direct client-to-database capabilities, a lightweight Node.js layer is designed for heavy media operations and SMS configurations.

### Key Node.js Responsibilities:
1.  **Audio Conversion & Transcoding:**
    *   Artisans record voice notes directly from mobile browsers (typically yielding `.webm` or `.ogg` via the MediaRecorder API).
    *   A Node.js function using `fluent-ffmpeg` transcodes uploaded raw audio formats to standard `.mp3` or `.aac` to guarantee consistent playback compatibility across older Android/iOS devices.
2.  **Auth - Name And Password**
3.  **WhatsApp Link Generator Helper:**
    *   Dynamic generation of WhatsApp Click-to-Chat links.
    *   Escapes and structures pre-filled messages mapping to specific buyer languages:
        ```
        https://wa.me/{artisan_phone}?text={urlencoded_message}
        ```

---

## 4. Key Security & Operational Practices

*   **Row-Level Security (RLS):** Under no circumstance can write operations bypass authentication validation checks.
*   **Media Compression:** Compress product images on the client side or via a Node.js utility before uploading to Supabase to save storage space and bandwidth.
*   **Database Indexes:** Keep index queries optimized on filters such as state/category for fast pagination on cheap mobile devices.
