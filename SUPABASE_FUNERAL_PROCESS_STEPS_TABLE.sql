-- ========================================
-- Funeral Process Steps Table Schema
-- ========================================
-- Complete multilingual funeral process management system
-- Supports multiple images and step ordering

-- Drop existing table if needed (for development)
-- DROP TABLE IF EXISTS funeral_process_steps CASCADE;

-- Create table with images array and step_order
CREATE TABLE IF NOT EXISTS funeral_process_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  locale TEXT NOT NULL CHECK (locale IN ('ko', 'vi')),
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_locale_step_order UNIQUE (locale, step_order) -- Ensure unique step_order per locale
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_funeral_process_steps_locale 
  ON funeral_process_steps(locale);

CREATE INDEX IF NOT EXISTS idx_funeral_process_steps_step_order 
  ON funeral_process_steps(locale, step_order ASC);

CREATE INDEX IF NOT EXISTS idx_funeral_process_steps_created_at 
  ON funeral_process_steps(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE funeral_process_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (for production website)
CREATE POLICY "Public read access for funeral_process_steps" ON funeral_process_steps
  FOR SELECT
  USING (true);

-- Policy: Authenticated insert access (for admin API)
CREATE POLICY "Authenticated insert access for funeral_process_steps" ON funeral_process_steps
  FOR INSERT
  WITH CHECK (true);

-- Policy: Authenticated update access (for admin API)
CREATE POLICY "Authenticated update access for funeral_process_steps" ON funeral_process_steps
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated delete access (for admin API)
CREATE POLICY "Authenticated delete access for funeral_process_steps" ON funeral_process_steps
  FOR DELETE
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_funeral_process_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_funeral_process_steps_updated_at ON funeral_process_steps;
CREATE TRIGGER update_funeral_process_steps_updated_at
  BEFORE UPDATE ON funeral_process_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_funeral_process_steps_updated_at();

-- ========================================
-- Supabase Storage Bucket Setup
-- ========================================
-- Note: Storage buckets must be created via Supabase Dashboard or Storage API
-- This SQL creates the bucket if it doesn't exist (requires superuser)

-- Create storage bucket for funeral process images
-- Note: This requires superuser privileges. If it fails, create manually via Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "funeral_process"
-- 4. Public: true (for public access to images)
-- 5. File size limit: 5MB (or as needed)
-- 6. Allowed MIME types: image/*

-- Attempt to create bucket (may fail if not superuser - create manually if needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'funeral_process',
  'funeral_process',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Public read access
CREATE POLICY "Public read access for funeral_process" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'funeral_process');

-- Storage policy: Authenticated upload access
CREATE POLICY "Authenticated upload access for funeral_process" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'funeral_process');

-- Storage policy: Authenticated update access
CREATE POLICY "Authenticated update access for funeral_process" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'funeral_process');

-- Storage policy: Authenticated delete access
CREATE POLICY "Authenticated delete access for funeral_process" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'funeral_process');

-- ========================================
-- Usage Instructions
-- ========================================
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. If storage bucket creation fails, create manually via Dashboard:
--    - Go to Storage → New bucket
--    - Name: funeral_process
--    - Public: true
-- 6. Verify table creation in Table Editor

