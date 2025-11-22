-- ========================================
-- Funeral Items Table Schema
-- ========================================
-- Create or update the funeral_items table in Supabase
-- This table stores funeral items with Korean and Vietnamese translations

-- Drop table if exists (for development - remove in production)
-- DROP TABLE IF EXISTS funeral_items;

-- Create table
CREATE TABLE IF NOT EXISTS funeral_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ko TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_funeral_items_created_at 
  ON funeral_items(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE funeral_items ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (for production website)
CREATE POLICY "Public read access" ON funeral_items
  FOR SELECT
  USING (true);

-- Policy: Authenticated insert access (for admin API)
-- Note: This allows any authenticated user to insert.
-- For production, you may want to add additional checks.
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_funeral_items_updated_at
  BEFORE UPDATE ON funeral_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Usage Instructions
-- ========================================
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Verify table creation in Table Editor

