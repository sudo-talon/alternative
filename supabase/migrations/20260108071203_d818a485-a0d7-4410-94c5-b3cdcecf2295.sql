-- Add featured_image_url column to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS featured_image_url TEXT;