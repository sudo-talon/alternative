-- Fix for "Could not find 'is_approved' column" error
-- Run this script in your Supabase Dashboard SQL Editor

-- 1. Add approval fields to enrollments
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Create policies for enrollment approval
-- Allow instructors to update enrollments for their own courses
CREATE POLICY "Instructors can update enrollments for their courses"
  ON public.enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Create gallery_categories table (Required for Picture Gallery enhancements)
CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS on gallery_categories
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Policies for gallery_categories
CREATE POLICY "Gallery categories are viewable by everyone" 
ON public.gallery_categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert gallery categories" 
ON public.gallery_categories FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update gallery categories" 
ON public.gallery_categories FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete gallery categories" 
ON public.gallery_categories FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Add category_id to gallery_pictures
ALTER TABLE public.gallery_pictures 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL;

-- 5. Insert default categories
INSERT INTO public.gallery_categories (name) VALUES ('Events'), ('Visits') ON CONFLICT (name) DO NOTHING;

-- 6. Ensure News table is accessible (Fix for potential news error)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'news' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON "public"."news" FOR SELECT USING (true);
    END IF;
END
$$;
