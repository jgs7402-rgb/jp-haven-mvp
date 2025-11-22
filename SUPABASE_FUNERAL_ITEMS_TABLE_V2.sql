-- ========================================
-- Funeral Items Table Schema (Updated)
-- ========================================
-- Complete multilingual funeral procedure management system
-- Supports multiple images and step ordering

-- Drop existing table if needed (for development)
-- DROP TABLE IF EXISTS funeral_items CASCADE;

-- Create table with images array and step_number
CREATE TABLE IF NOT EXISTS funeral_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ko TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  step_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_step_number UNIQUE (step_number) -- Ensure unique step numbers
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_funeral_items_step_number 
  ON funeral_items(step_number ASC);

CREATE INDEX IF NOT EXISTS idx_funeral_items_created_at 
  ON funeral_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE funeral_items ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (for production website)
CREATE POLICY "Public read access" ON funeral_items
  FOR SELECT
  USING (true);

-- Policy: Authenticated insert access (for admin API)
CREATE POLICY "Authenticated insert access" ON funeral_items
  FOR INSERT
  WITH CHECK (true);

-- Policy: Authenticated update access (for admin API)
CREATE POLICY "Authenticated update access" ON funeral_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated delete access (for admin API)
CREATE POLICY "Authenticated delete access" ON funeral_items
  FOR DELETE
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_funeral_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_funeral_items_updated_at ON funeral_items;
CREATE TRIGGER update_funeral_items_updated_at
  BEFORE UPDATE ON funeral_items
  FOR EACH ROW
  EXECUTE FUNCTION update_funeral_items_updated_at();

-- ========================================
-- Supabase Storage Bucket Setup
-- ========================================
-- Note: Storage buckets must be created via Supabase Dashboard or Storage API
-- This SQL creates the bucket if it doesn't exist (requires superuser)

-- Create storage bucket for funeral items images
-- Note: This requires superuser privileges. If it fails, create manually via Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "funeral_items"
-- 4. Public: true (for public access to images)
-- 5. File size limit: 5MB (or as needed)
-- 6. Allowed MIME types: image/*

-- Attempt to create bucket (may fail if not superuser - create manually if needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'funeral_items',
  'funeral_items',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'funeral_items');

-- Storage policy: Authenticated upload access
CREATE POLICY "Authenticated upload access" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'funeral_items');

-- Storage policy: Authenticated update access
CREATE POLICY "Authenticated update access" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'funeral_items');

-- Storage policy: Authenticated delete access
CREATE POLICY "Authenticated delete access" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'funeral_items');

-- ========================================
-- Usage Instructions
-- ========================================
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. If storage bucket creation fails, create manually via Dashboard:
--    - Go to Storage → New bucket
--    - Name: funeral_items
--    - Public: true
-- 6. Verify table creation in Table Editor
