-- Drop the conflicting authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view personnel" ON public.personnel;

-- Ensure the public policy exists and allows anonymous access
DROP POLICY IF EXISTS "Allow public to view personnel" ON public.personnel;
CREATE POLICY "Allow public to view personnel"
ON public.personnel
FOR SELECT
TO anon, authenticated
USING (true);