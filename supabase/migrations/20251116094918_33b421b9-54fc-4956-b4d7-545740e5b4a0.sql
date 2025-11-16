-- Create personnel table for civilian and military staff
CREATE TABLE IF NOT EXISTS public.personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL CHECK (category IN ('civilian', 'military')),
  position TEXT NOT NULL,
  department TEXT,
  rank TEXT,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leadership table
CREATE TABLE IF NOT EXISTS public.leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  rank TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

-- RLS policies for personnel
CREATE POLICY "Anyone can view personnel"
  ON public.personnel
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage personnel"
  ON public.personnel
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for leadership
CREATE POLICY "Anyone can view leadership"
  ON public.leadership
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage leadership"
  ON public.leadership
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_personnel_updated_at
  BEFORE UPDATE ON public.personnel
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_leadership_updated_at
  BEFORE UPDATE ON public.leadership
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();