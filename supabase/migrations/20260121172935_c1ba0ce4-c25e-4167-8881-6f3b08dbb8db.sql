-- Create gallery_pictures table
CREATE TABLE public.gallery_pictures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery_videos table
CREATE TABLE public.gallery_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.gallery_pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_videos ENABLE ROW LEVEL SECURITY;

-- Gallery pictures policies
CREATE POLICY "Anyone can view gallery pictures"
ON public.gallery_pictures FOR SELECT
USING (true);

CREATE POLICY "Admins can create gallery pictures"
ON public.gallery_pictures FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery pictures"
ON public.gallery_pictures FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery pictures"
ON public.gallery_pictures FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Gallery videos policies
CREATE POLICY "Anyone can view gallery videos"
ON public.gallery_videos FOR SELECT
USING (true);

CREATE POLICY "Admins can create gallery videos"
ON public.gallery_videos FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery videos"
ON public.gallery_videos FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery videos"
ON public.gallery_videos FOR DELETE
USING (has_role(auth.uid(), 'admin'));