-- Drop the existing restrictive SELECT policy on personnel
DROP POLICY IF EXISTS "Allow authenticated users to view personnel" ON public.personnel;

-- Create a new policy to allow public (anonymous) read access to personnel
CREATE POLICY "Allow public to view personnel"
ON public.personnel
FOR SELECT
TO anon, authenticated
USING (true);