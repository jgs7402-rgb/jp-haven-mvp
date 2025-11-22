# Complete Multilingual Funeral Procedure Management System

## ✅ Implementation Complete

All features have been implemented according to requirements.

---

## 📁 Files Created/Modified

### Database & Schema
- **`SUPABASE_FUNERAL_ITEMS_TABLE_V2.sql`**
  - Complete table schema with `images` array and `step_number`
  - Storage bucket setup instructions
  - RLS policies and triggers

### Translation Helper
- **`/src/lib/translate.ts`**
  - `translateKRtoVI()` function
  - GPT-4o model
  - Strict Vietnamese-only output (no English)
  - English word stripping

### Storage Helper
- **`/src/lib/supabaseStorage.ts`**
  - `uploadImageToStorage()` - Single image upload
  - `uploadMultipleImagesToStorage()` - Multiple images
  - `deleteImageFromStorage()` - Delete images
  - Supabase Storage bucket: `funeral_items`

### API Routes

#### Admin APIs
1. **`/src/app/api/admin/funeral-items/route.ts`**
   - GET: Fetch all items for admin

2. **`/src/app/api/admin/funeral-items/create/route.ts`**
   - POST: Create new item
   - Auto-translates KR → VI
   - Accepts manual Vietnamese override
   - Supports multiple images

3. **`/src/app/api/admin/funeral-items/update/route.ts`**
   - PUT: Update existing item
   - Re-translates on Korean update
   - Manual Vietnamese override support
   - Syncs KR + VI

4. **`/src/app/api/admin/funeral-items/upload/route.ts`**
   - POST: Upload multiple images to Supabase Storage

5. **`/src/app/api/admin/funeral-items/translate/route.ts`**
   - POST: Translate KR → VI on demand

#### Public API
6. **`/src/app/api/funeral-items/route.ts`**
   - GET: Public API
   - Locale-aware (ko/vi)
   - Returns only relevant language content
   - Ordered by `step_number`

### UI Pages

#### Admin UI
- **`/src/app/admin/funeral-items/page.tsx`**
  - Multiple image upload
  - Korean title/description inputs
  - Vietnamese manual edit fields
  - "Translate Again" button
  - Step number input
  - Edit/Update functionality
  - Item list display

#### Public UI
- **`/src/app/[locale]/funeral-procedures/page.tsx`**
  - 3-column responsive grid (1 col mobile, 2 tablet, 3 desktop)
  - Locale-aware content display
  - Korean pages: show Korean content only
  - Vietnamese pages: show Vietnamese content only (NO English)
  - Multiple images support
  - Step-by-step display

---

## 🗄️ Database Setup

### Step 1: Create Supabase Table

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Execute `SUPABASE_FUNERAL_ITEMS_TABLE_V2.sql`
4. Verify table creation in **Table Editor**

### Step 2: Create Storage Bucket

**Option A: Via SQL (if superuser)**
- The SQL script includes bucket creation
- May fail if not superuser

**Option B: Via Dashboard (Recommended)**
1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `funeral_items`
4. Public: **true** (for public image access)
5. File size limit: 5MB
6. Allowed MIME types: `image/*`

### Table Schema

```sql
funeral_items
├── id (uuid, primary key)
├── title_ko (text, NOT NULL)
├── title_vi (text, NOT NULL)
├── description_ko (text, NOT NULL)
├── description_vi (text, NOT NULL)
├── images (text[], default '{}')
├── step_number (integer, NOT NULL, UNIQUE)
├── created_at (timestamp with time zone, default now())
└── updated_at (timestamp with time zone, default now())
```

---

## 🔧 Environment Variables

### Required

```env
# OpenAI API Key (for translation)
OPENAI_API_KEY=sk-...

# Supabase (already configured in supabaseClient.ts)
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Vercel Setup

1. Vercel Dashboard → Settings → Environment Variables
2. Add `OPENAI_API_KEY`
3. Redeploy

---

## 📋 Feature Checklist

### ✅ Core Features
- [x] Save Korean version to Supabase
- [x] Auto-translate Korean → Vietnamese
- [x] Manual Vietnamese editing
- [x] Save both KR + VI together
- [x] Multiple images support (images[] array)
- [x] Step number ordering
- [x] Korean & Vietnamese sync
- [x] Public 3-column grid display
- [x] Locale-aware content (ko/vi)
- [x] Vietnamese pages: NO English text

### ✅ Admin Features
- [x] Multiple image upload to Supabase Storage
- [x] Korean title/description inputs
- [x] Vietnamese manual edit fields
- [x] "Translate Again" button
- [x] Step number input
- [x] Edit existing items
- [x] Update with re-translation
- [x] Item list display

### ✅ Public Features
- [x] 3-column responsive grid
- [x] Locale-aware display
- [x] Multiple images per item
- [x] Step-by-step ordering
- [x] No English on Vietnamese pages

---

## 🚀 Usage Guide

### Admin: Create New Item

1. Navigate to `/admin/funeral-items`
2. Enter **Step Number**
3. Upload **Images** (multiple files)
   - Click "Choose File" → Select multiple images
   - Click "Upload" button
   - Images uploaded to Supabase Storage
4. Enter **Korean Title** and **Description**
5. Click **"다시 번역"** (Translate Again) button
   - Auto-translates to Vietnamese
6. **Optionally edit** Vietnamese fields manually
7. Click **"저장하기"** (Save)
   - Item saved with both KR + VI versions

### Admin: Edit Existing Item

1. Click **"수정"** (Edit) button on any item
2. Form pre-fills with existing data
3. Make changes to Korean or Vietnamese
4. Click **"업데이트"** (Update)
   - If Korean changed → auto re-translates
   - If only Vietnamese changed → uses manual value

### Public: View Funeral Procedures

**Korean Site:**
- Navigate to `/ko/funeral-procedures`
- Displays Korean content only
- 3-column grid layout

**Vietnamese Site:**
- Navigate to `/vi/funeral-procedures`
- Displays Vietnamese content only
- **NO English text** (strictly Vietnamese)
- 3-column grid layout

---

## 🔄 Data Flow

```
Admin enters → KR title + KR description + step_number + images[]
    ↓
Admin clicks "Translate Again"
    ↓
API calls translateKRtoVI() via OpenAI
    ↓
Vietnamese translation returned
    ↓
Admin can manually edit Vietnamese
    ↓
Admin clicks "Save"
    ↓
API saves (KR + VI + images[] + step_number) to Supabase
    ↓
Public site fetches from /api/funeral-items?locale=ko|vi
    ↓
Displays locale-specific content in 3-column grid
```

---

## 🎨 UI Features

### Admin Page
- **Multiple Image Upload**: Select multiple files, upload to Supabase Storage
- **Image Preview**: Shows uploaded images with remove option
- **Korean Inputs**: Title and description fields
- **Vietnamese Inputs**: Editable fields (auto-filled or manual)
- **Translate Button**: Re-translates Korean → Vietnamese
- **Step Number**: Numeric input for ordering
- **Edit Mode**: Click "수정" to edit existing items
- **Item List**: Shows all items with images and both languages

### Public Page
- **Responsive Grid**: 
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- **Step Badges**: Shows step number
- **Multiple Images**: Displays all images per item
- **Locale-Aware**: Korean/Vietnamese content based on URL
- **No English**: Vietnamese pages strictly Vietnamese only

---

## 🧪 Testing Checklist

### Local Development

1. **Database Setup**
   - [ ] Run SQL script in Supabase
   - [ ] Create storage bucket
   - [ ] Verify table exists

2. **Environment Variables**
   - [ ] Set `OPENAI_API_KEY` in `.env.local`

3. **Admin Testing**
   - [ ] Navigate to `/admin/funeral-items`
   - [ ] Upload multiple images
   - [ ] Enter Korean content
   - [ ] Test "Translate Again" button
   - [ ] Edit Vietnamese manually
   - [ ] Save new item
   - [ ] Edit existing item
   - [ ] Verify items appear in list

4. **Public Testing**
   - [ ] Navigate to `/ko/funeral-procedures`
   - [ ] Verify Korean content displays
   - [ ] Navigate to `/vi/funeral-procedures`
   - [ ] Verify Vietnamese content displays
   - [ ] Verify NO English text on Vietnamese page
   - [ ] Test responsive grid (mobile/tablet/desktop)

### Production (Vercel)

1. **Environment Variables**
   - [ ] Add `OPENAI_API_KEY` to Vercel
   - [ ] Verify Supabase credentials

2. **Deploy & Test**
   - [ ] Deploy to Vercel
   - [ ] Test admin functionality
   - [ ] Test public pages
   - [ ] Verify translations work
   - [ ] Verify images upload correctly

---

## 🐛 Troubleshooting

### Translation Issues
- **Error**: "OpenAI API key is not configured"
  - **Solution**: Set `OPENAI_API_KEY` in environment variables

- **Error**: "Failed to translate"
  - **Solution**: Check OpenAI API key validity and quota

### Image Upload Issues
- **Error**: "Failed to upload images"
  - **Solution**: Verify Supabase Storage bucket `funeral_items` exists and is public

### Database Issues
- **Error**: "Failed to save funeral item"
  - **Solution**: Verify table `funeral_items` exists and RLS policies are correct

### Public Page Issues
- **No items showing**
  - **Solution**: Check API endpoint `/api/funeral-items?locale=ko|vi`
  - Verify items exist in database

---

## 📝 API Endpoints Summary

### Admin Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/funeral-items` | Get all items |
| POST | `/api/admin/funeral-items/create` | Create new item |
| PUT | `/api/admin/funeral-items/update` | Update item |
| POST | `/api/admin/funeral-items/upload` | Upload images |
| POST | `/api/admin/funeral-items/translate` | Translate KR→VI |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/funeral-items?locale=ko` | Get Korean items |
| GET | `/api/funeral-items?locale=vi` | Get Vietnamese items |

---

## ✨ Key Features Implemented

1. ✅ **Complete multilingual support** (KR + VI)
2. ✅ **Automatic translation** (OpenAI GPT-4o)
3. ✅ **Manual Vietnamese editing**
4. ✅ **Multiple images per item**
5. ✅ **Step-by-step ordering**
6. ✅ **Supabase Storage integration**
7. ✅ **3-column responsive grid**
8. ✅ **Strict Vietnamese-only** (no English)
9. ✅ **Real-time sync** (KR ↔ VI)
10. ✅ **Production-ready** (Vercel compatible)

---

## 🎯 Next Steps

1. **Run SQL script** in Supabase Dashboard
2. **Create storage bucket** `funeral_items`
3. **Set environment variable** `OPENAI_API_KEY`
4. **Test locally**: `npm run dev`
5. **Deploy to Vercel** with environment variables
6. **Test in production**

All code is complete and ready to use! 🚀

