# Funeral Items Management Feature

## Overview

This feature allows admins to upload images and enter content for funeral procedures/management items. The system automatically:
- Saves the original Korean version
- Translates content to Vietnamese using OpenAI API
- Saves both versions (ko + vi) in Supabase
- Syncs both languages so they are always paired together
- Saves Korean and Vietnamese image captions together
- Immediately reflects all updated data on the live production website

## Implementation Summary

### Files Created/Modified

1. **`/src/lib/translate.ts`**
   - OpenAI translation helper
   - Translates Korean → Vietnamese using GPT-4o
   - Natural, formal translation for web content

2. **`/src/app/api/admin/funeral-items/route.ts`**
   - POST: Create new funeral item with auto-translation
   - GET: Fetch all funeral items
   - Handles Korean → Vietnamese translation automatically

3. **`/src/app/admin/funeral-items/page.tsx`**
   - Admin UI for managing funeral items
   - Image upload functionality
   - Korean title/description inputs
   - Automatic Vietnamese translation (not editable by admin)
   - List view of all items

4. **`/SUPABASE_FUNERAL_ITEMS_TABLE.sql`**
   - SQL script to create the `funeral_items` table
   - Includes RLS policies and triggers

## Database Setup

### Step 1: Create Supabase Table

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Open and execute `SUPABASE_FUNERAL_ITEMS_TABLE.sql`
4. Verify table creation in **Table Editor**

### Table Schema

```sql
funeral_items
├── id (uuid, primary key)
├── title_ko (text)
├── title_vi (text)
├── description_ko (text)
├── description_vi (text)
├── image_url (text, nullable)
├── created_at (timestamp with time zone)
└── updated_at (timestamp with time zone)
```

## Environment Variables Required

Add to `.env.local` (for local development) and Vercel (for production):

```env
OPENAI_API_KEY=sk-...
```

## API Endpoints

### POST `/api/admin/funeral-items`
Creates a new funeral item with automatic translation.

**Request:**
```json
{
  "title_ko": "Korean title",
  "description_ko": "Korean description",
  "image_url": "https://..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Funeral item created successfully",
  "data": {
    "id": "...",
    "title_ko": "...",
    "title_vi": "...",
    "description_ko": "...",
    "description_vi": "...",
    "image_url": "...",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### GET `/api/admin/funeral-items`
Fetches all funeral items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title_ko": "...",
      "title_vi": "...",
      ...
    }
  ]
}
```

## Admin UI Usage

### Access
Navigate to: `/admin/funeral-items`

### Adding New Item

1. **Upload Image (Optional)**
   - Click "Choose File" to select an image
   - Click "Upload" button
   - Wait for upload to complete

2. **Enter Korean Content**
   - Fill in "제목 (한국어)" - Korean title
   - Fill in "설명 (한국어)" - Korean description

3. **Save**
   - Click "저장하기" button
   - System automatically:
     - Translates Korean → Vietnamese using OpenAI
     - Saves both versions to Supabase
     - Refreshes the item list

### Viewing Items

- All saved items are displayed in a grid below the form
- Each item shows:
  - Image (if available)
  - Korean title and description
  - Vietnamese title and description (auto-translated)
  - Creation date

## Data Flow

```
Admin enters → KR title + KR description + image
    ↓
API receives KR data
    ↓
API calls translate(KR→VI) via OpenAI
    ↓
API stores (KR + VI + image_url) into Supabase
    ↓
Live site reads from Supabase and displays both versions
    ↓
Admin sees success message + refreshed list
```

## Translation Details

- **Model**: GPT-4o
- **System Prompt**: Professional translator specializing in funeral service content
- **Translation Style**: Natural Vietnamese, appropriate for professional funeral service websites
- **Temperature**: 0.3 (consistent translations)
- **Auto-translation**: Every Korean update triggers re-translation to Vietnamese

## Sync Rules

- ✅ Every Korean update triggers automatic Vietnamese re-translation
- ✅ Korean and Vietnamese versions are always paired together
- ✅ No mismatch allowed - Vietnamese is always derived from Korean
- ✅ Admin cannot manually edit Vietnamese version

## Error Handling

- Missing OpenAI API key → Error message displayed
- Translation failure → Error logged, request fails gracefully
- Supabase errors → Detailed error messages returned
- Validation errors → Clear validation messages

## Testing

### Local Development

1. Set `OPENAI_API_KEY` in `.env.local`
2. Run `npm run dev`
3. Navigate to `/admin/funeral-items`
4. Test adding new items
5. Verify translation and database storage

### Production (Vercel)

1. Add `OPENAI_API_KEY` to Vercel environment variables
2. Deploy to Vercel
3. Test in production environment
4. Verify Supabase connection

## Future Enhancements

- [ ] Edit existing items (PUT endpoint)
- [ ] Delete items (DELETE endpoint)
- [ ] Bulk import/export
- [ ] Translation quality review/override
- [ ] Image captions with automatic translation
- [ ] Multiple images per item

