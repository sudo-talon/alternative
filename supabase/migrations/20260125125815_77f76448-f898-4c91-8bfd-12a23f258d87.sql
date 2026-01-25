-- Add is_faculty column to personnel table for College Leadership section
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS is_faculty boolean DEFAULT false;

-- Add display_order column for ordering leadership profiles
ALTER TABLE public.personnel ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;