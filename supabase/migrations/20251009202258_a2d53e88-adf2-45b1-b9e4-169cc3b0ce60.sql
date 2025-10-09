-- Create student categories table
CREATE TABLE public.student_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN category_id UUID REFERENCES public.student_categories(id);

-- Enable RLS on student_categories
ALTER TABLE public.student_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view student categories"
ON public.student_categories
FOR SELECT
USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage student categories"
ON public.student_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.student_categories (name, description) VALUES
  ('Nigerian Army', 'Army personnel and cadets'),
  ('Nigerian Navy', 'Navy personnel and cadets'),
  ('Nigerian Air Force', 'Air Force personnel and cadets');

-- Create analytics view for admin dashboard
CREATE OR REPLACE VIEW public.enrollment_analytics AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  COUNT(e.id) as total_enrollments,
  COUNT(DISTINCT e.student_id) as unique_students
FROM public.courses c
LEFT JOIN public.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title;

-- Create student category analytics view
CREATE OR REPLACE VIEW public.category_analytics AS
SELECT 
  sc.id as category_id,
  sc.name as category_name,
  COUNT(p.id) as student_count
FROM public.student_categories sc
LEFT JOIN public.profiles p ON sc.id = p.category_id AND p.role = 'student'
GROUP BY sc.id, sc.name;