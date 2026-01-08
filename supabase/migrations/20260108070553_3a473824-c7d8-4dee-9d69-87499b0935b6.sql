-- Drop the existing public access policy
DROP POLICY IF EXISTS "Anyone can view personnel" ON public.personnel;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view personnel" 
ON public.personnel 
FOR SELECT 
USING (auth.uid() IS NOT NULL);