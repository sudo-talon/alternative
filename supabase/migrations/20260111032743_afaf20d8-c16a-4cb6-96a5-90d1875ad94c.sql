-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create magazines table for E-Magazine section
CREATE TABLE public.magazines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    issue TEXT,
    description TEXT,
    cover_image_url TEXT,
    pdf_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view magazines" 
ON public.magazines 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create magazines" 
ON public.magazines 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Admins can update magazines" 
ON public.magazines 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Admins can delete magazines" 
ON public.magazines 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::text));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_magazines_updated_at
BEFORE UPDATE ON public.magazines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for magazines (cover images and PDFs)
INSERT INTO storage.buckets (id, name, public) VALUES ('magazines', 'magazines', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for magazine files
CREATE POLICY "Public can view magazine files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'magazines');

CREATE POLICY "Admins can upload magazine files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'magazines' AND has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Admins can update magazine files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'magazines' AND has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Admins can delete magazine files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'magazines' AND has_role(auth.uid(), 'admin'::text));