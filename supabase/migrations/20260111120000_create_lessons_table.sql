create table public.lessons (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  content text null,
  video_url text null,
  order_index integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint lessons_pkey primary key (id)
);

alter table public.lessons enable row level security;

create policy "Instructors can view their own course lessons" on public.lessons
  for select
  using (exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
    and courses.instructor_id = auth.uid()
  ));

create policy "Instructors can insert lessons for their courses" on public.lessons
  for insert
  with check (exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
    and courses.instructor_id = auth.uid()
  ));

create policy "Instructors can update lessons for their courses" on public.lessons
  for update
  using (exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
    and courses.instructor_id = auth.uid()
  ));

create policy "Instructors can delete lessons for their courses" on public.lessons
  for delete
  using (exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
    and courses.instructor_id = auth.uid()
  ));

create policy "Students can view lessons for enrolled courses" on public.lessons
  for select
  using (exists (
    select 1 from public.enrollments
    where enrollments.course_id = lessons.course_id
    and enrollments.student_id = auth.uid()
  ));
