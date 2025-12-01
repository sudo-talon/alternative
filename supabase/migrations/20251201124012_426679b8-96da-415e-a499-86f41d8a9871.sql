-- Create pg_programs table for postgraduate program content
CREATE TABLE public.pg_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department TEXT NOT NULL,
  degree_types TEXT NOT NULL,
  specializations TEXT[],
  requirements TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pg_programs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view pg programs" 
ON public.pg_programs 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create pg programs" 
ON public.pg_programs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pg programs" 
ON public.pg_programs 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pg programs" 
ON public.pg_programs 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Insert initial data
INSERT INTO public.pg_programs (department, degree_types, specializations, requirements, display_order) VALUES
('Department of Geography and Environmental Sustainability', 'M.Sc. and PhD', 
 ARRAY['Cartography', 'Remote Sensing & Geographic Information System'],
 'Candidates applying for the M.Sc. degree in Geography should hold Bachelors degree with a minimum CGPA of 3.0 on a scale of 5.0 in Geography, Education/Geography or related disciplines in the Social, Physical, Biological, Agricultural and Environmental Sciences or Engineering etc. While candidates applying for the PhD degree in Geography and Environmental Sustainability, Cartography and Remote Sensing should hold Master''s degree with a minimum CGPA of at least 3.5 on a scale of 5.0 in a relevant area of Geography or the related disciplines.',
 1),
('Department of Political Science', 'PGD, M.Sc. and PhD',
 ARRAY['International Relations and Diplomacy', 'Conflict, Peace and Strategic Studies', 'Human Security and Counter-Terrorism', 'Soft Protocol and Diplomacy', 'Political and Economic Intelligence'],
 'The basic entry qualification for admission into the M.Sc. programme is a Bachelor''s Degree with at least a Second-Class Lower Division with not less than 3.00 GPA or its equivalent. Also, candidates with appropriate Postgraduate Diploma of the University of Nigeria or of other recognized Universities with at least 3.50 GPA on a 5-point scale. In addition, the candidate must satisfy the Departmental O''Level and/or Direct Entry general entry requirements for degree programmes.',
 2),
('Department of Sociology/Anthropology', 'M.Sc. and PhD',
 ARRAY['Criminology, Conflict and Change'],
 'The criteria for admission into the M.Sc programme: Matriculation requirement of the University, which is five (5) O-level Credit passes including English Language with either of the following: A student with at least 3rd class degree in any area of study, HND holders with a minimum of Upper Credit from recognized institution may also be considered, or BSc holders with pass degree with 5 years and above post-graduation experience.',
 3),
('Institute of Social Policy', 'PGD, MSP, M.Sc. and PhD',
 ARRAY['Social Policy'],
 'The criteria for admission into M.Sc. Social Policy programme: Five (5) O-level credits passes including English; Candidates with at least 2nd Class honours Lower Division in Social or Management Science; Candidates with a PGD in Social Policy with a CGPA of 3.5 on a 5-point scale or its equivalent. For Ph.D programme: Candidates must have academic Master''s degree in Social Policy with a minimum CGPA of 3.0/4.0 or 3.5/5.0 and Project score not lower than 60%.',
 4),
('Department of Psychology', 'M.Sc. and PhD',
 ARRAY['Criminal Psychology and Forensic Studies'],
 'The entry qualification for admission into the M.Sc. programme is a Bachelor''s Degree with at least a Second-Class Lower Division with not less than 3.00 GPA or its equivalent in Psychology or other related fields in Criminal and Forensic Science. Also, candidates with appropriate Postgraduate Diploma of the University of Nigeria or of other recognised Universities with at least 3.50 GPA on a 5-point scale. While the basic entry qualification for admission into the PhD programme is a Master''s Degree in relevant areas from the University of Nigeria or other recognised universities with at least 3.50 CGPA on a 5-point scale.',
 5),
('Department of Public Administration', 'M.Sc and PhD',
 ARRAY['Strategic Intelligence and Security Management'],
 'The criteria for admission into M.Sc. Strategic Intelligence programme: Five (5) O-level credits passes including English; Candidates with at least 2nd Class honours Lower Division in Social or Management Science or other related fields; Candidates with a PGD in Social Policy with a CGPA of 3.5 on a 5 point scale or its equivalent. While the basic entry qualification for admission into the PhD programme is a Master''s Degree in relevant areas from the University of Nigeria or other recognised universities with at least 3.50 CGPA on a 5-point scale.',
 6);