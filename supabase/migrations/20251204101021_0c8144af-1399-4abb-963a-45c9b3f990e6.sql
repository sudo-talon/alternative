-- Create a security definer function to check user role from profiles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Instructors and admins can view all profiles" ON public.profiles;

-- Recreate the policy using the security definer function
CREATE POLICY "Instructors and admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  get_user_role(auth.uid()) = ANY (ARRAY['instructor'::user_role, 'admin'::user_role])
);