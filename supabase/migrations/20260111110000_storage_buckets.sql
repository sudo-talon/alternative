
-- Create news-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view images
CREATE POLICY "Public Access News Images" ON storage.objects 
FOR SELECT USING (bucket_id = 'news-images');

-- Policy to allow authenticated users (admins/instructors) to upload images
CREATE POLICY "Authenticated Upload News Images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to update images
CREATE POLICY "Authenticated Update News Images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete images
CREATE POLICY "Authenticated Delete News Images" ON storage.objects 
FOR DELETE USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');
