-- Fix the RLS policies for news and leadership tables
-- The issue is that the existing policies are RESTRICTIVE, which blocks access when there are no permissive policies

-- Drop the restrictive SELECT policies and recreate them as PERMISSIVE for public viewing
DROP POLICY IF EXISTS "Anyone can view news" ON public.news;
DROP POLICY IF EXISTS "Anyone can view leadership" ON public.leadership;

-- Recreate as PERMISSIVE policies (default behavior)
CREATE POLICY "Anyone can view news"
ON public.news
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can view leadership"
ON public.leadership
FOR SELECT
TO public
USING (true);