-- Create gallery_categories table
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

-- Add category_id to gallery_pictures
ALTER TABLE public.gallery_pictures 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL;

-- Insert default categories
INSERT INTO public.gallery_categories (name) VALUES ('Events'), ('Visits') ON CONFLICT (name) DO NOTHING;
