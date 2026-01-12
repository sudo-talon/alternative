BEGIN;

DROP POLICY IF EXISTS "Public courses lessons are viewable by everyone" ON public.lessons;

DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
CREATE POLICY "Participants can view quizzes"
ON public.quizzes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE c.id = quizzes.course_id AND e.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Participants can view quiz questions"
ON public.quiz_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE q.id = quiz_questions.quiz_id AND e.student_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE OR REPLACE FUNCTION public.send_notification_to_users(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_category_id IS NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
    SELECT id, p_title, p_message, p_type, p_related_id, p_related_type
    FROM auth.users;
  ELSE
    INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
    SELECT id, p_title, p_message, p_type, p_related_id, p_related_type
    FROM profiles
    WHERE category_id = p_category_id;
  END IF;
END;
$$;

COMMIT;

