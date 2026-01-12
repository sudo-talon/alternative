-- Add is_suspended to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Add lesson_id to quizzes
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;

-- Policies for lessons
CREATE POLICY "Public courses lessons are viewable by everyone" ON public.lessons FOR SELECT USING (true);

CREATE POLICY "Instructors can insert lessons" ON public.lessons FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT instructor_id FROM public.courses WHERE id = course_id)
  OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Instructors can update lessons" ON public.lessons FOR UPDATE USING (
  auth.uid() IN (SELECT instructor_id FROM public.courses WHERE id = course_id)
  OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Instructors can delete lessons" ON public.lessons FOR DELETE USING (
  auth.uid() IN (SELECT instructor_id FROM public.courses WHERE id = course_id)
  OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add completed_lessons table for tracking progress
CREATE TABLE IF NOT EXISTS public.completed_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, lesson_id)
);

ALTER TABLE public.completed_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own completed lessons" ON public.completed_lessons FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own completed lessons" ON public.completed_lessons FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Update magazines policies to include instructors
DROP POLICY IF EXISTS "Instructors can insert magazines" ON public.magazines;
CREATE POLICY "Instructors can insert magazines" ON public.magazines FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'instructor'))
);

DROP POLICY IF EXISTS "Instructors can update magazines" ON public.magazines;
CREATE POLICY "Instructors can update magazines" ON public.magazines FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'instructor'))
);

DROP POLICY IF EXISTS "Instructors can delete magazines" ON public.magazines;
CREATE POLICY "Instructors can delete magazines" ON public.magazines FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'instructor'))
);
