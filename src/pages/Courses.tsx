import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient as supabase } from "@/lib/supabase";
import departmentsHero from "@/assets/departments-hero.webp";
import type { Database } from "@/integrations/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

type UICourse = {
  id?: string;
  title: string;
  description?: string | null;
  category?: string | null;
  is_paid?: boolean;
  price_cents?: number | null;
  currency?: string;
};

type UICategory = {
  category: string;
  courses: UICourse[];
};

const Courses = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const courses = (data || []) as CourseRow[];

  const staticCategories: UICategory[] = [
    {
      category: "Generic Courses",
      courses: [
        { title: "Basic Intelligence Officers' Course", description: "Foundation training for intelligence officers" },
        { title: "Defence Intelligence Officers' Course", description: "Comprehensive defence intelligence training" },
        { title: "Advanced Defence Intelligence Officers' Course", description: "Advanced training for senior officers" },
        { title: "Junior Defence Intelligence Basic Course", description: "Entry-level training for junior personnel" },
        { title: "Junior Defence Intelligence Intermediate Course", description: "Intermediate skills development" },
        { title: "Junior Defence Intelligence Advanced Course", description: "Advanced training for junior officers" },
      ],
    },
    {
      category: "Specialized Courses",
      courses: [
        { title: "Psychological Operations Course", description: "Strategic psychological operations training" },
        { title: "Intelligence Analysis Officers' Course", description: "Advanced intelligence analysis techniques" },
        { title: "Security Investigation and Interrogation Course", description: "Professional interrogation methods" },
        { title: "Document Security Course", description: "Document classification and protection" },
        { title: "Joint Military Attache / Advisers Course", description: "Diplomatic and advisory training" },
        { title: "Special Intelligence and Security Course", description: "Specialized intelligence operations" },
      ],
    },
    {
      category: "Language Courses",
      courses: [
        { title: "Basic French Course", description: "Foundation French language training" },
        { title: "Intermediate French Language Course", description: "Intermediate French proficiency" },
        { title: "Basic German Language Course", description: "Foundation German language training" },
      ],
    },
    {
      category: "Strategic Courses",
      courses: [
        { title: "The National Security Training Seminar", description: "National security strategy and policy" },
        { title: "Intelligence Analysis Course", description: "Strategic intelligence assessment" },
        { title: "Peace and Conflict Studies", description: "Peace operations and conflict resolution" },
        { title: "Strategic Security Course", description: "Strategic security planning and management" },
      ],
    },
  ];

  const dynamicCategories: UICategory[] | null = courses && courses.length > 0
    ? Object.values(
        courses.reduce((acc, course) => {
          const catKey = course.category || "All Courses";
          if (!acc[catKey]) {
            acc[catKey] = { category: catKey, courses: [] as UICourse[] };
          }
          acc[catKey].courses.push({
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            is_paid: false,
            price_cents: null,
            currency: "NGN",
          });
          return acc;
        }, {} as Record<string, UICategory>)
      )
    : null;

  const courseCategories = dynamicCategories && dynamicCategories.length > 0 ? dynamicCategories : staticCategories;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[300px] h-auto py-12 md:py-0 md:h-[400px] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img 
            src={departmentsHero} 
            alt="Departments hero" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <GraduationCap className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground shrink-0" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground">Our Courses</h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              Pioneering Excellence in Intelligence and Strategic Leadership since 2001
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading && (
          <div className="mb-6 text-center text-muted-foreground">Loading courses...</div>
        )}
        {courseCategories.map((category, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.courses.map((course, courseIdx) => (
                <Card 
                  key={courseIdx} 
                  className="shadow-elevated hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => {
                    const identifier = course.id || encodeURIComponent(course.title);
                    navigate(`/course/${identifier}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-primary rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight break-words">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <CardDescription>
                        {category.category}
                      </CardDescription>
                      {course.is_paid && course.price_cents != null && (
                        <Badge variant="secondary" className="text-xs">
                          Paid • {(course.price_cents / 100).toLocaleString(undefined, {
                            style: "currency",
                            currency: course.currency || "NGN",
                            maximumFractionDigits: 0,
                          })}
                        </Badge>
                      )}
                      {course.is_paid === false && (
                        <Badge variant="outline" className="text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
                    <Button className="w-full min-h-[44px]">View Details & Enroll</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      </div>
      <Footer />
    </div>
  );
};

export default Courses;
