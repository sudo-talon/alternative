-- Add approval fields to enrollments
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Allow instructors to update enrollments for their own courses
CREATE POLICY "Instructors can update enrollments for their courses"
  ON public.enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = enrollments.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Allow admins to manage all enrollments
CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

