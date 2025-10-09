-- Drop the existing views
DROP VIEW IF EXISTS public.enrollment_analytics;
DROP VIEW IF EXISTS public.category_analytics;

-- Recreate views with security invoker (default, safer option)
CREATE OR REPLACE VIEW public.enrollment_analytics 
WITH (security_invoker = true) AS
SELECT 
  c.id as course_id,
  c.title as course_title,
  COUNT(e.id) as total_enrollments,
  COUNT(DISTINCT e.student_id) as unique_students
FROM public.courses c
LEFT JOIN public.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title;

CREATE OR REPLACE VIEW public.category_analytics 
WITH (security_invoker = true) AS
SELECT 
  sc.id as category_id,
  sc.name as category_name,
  COUNT(p.id) as student_count
FROM public.student_categories sc
LEFT JOIN public.profiles p ON sc.id = p.category_id AND p.role = 'student'
GROUP BY sc.id, sc.name;

-- Fix handle_updated_at function to set search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;