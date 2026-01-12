import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import departmentsHero from "@/assets/departments-hero.webp";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Courses = () => {
  const navigate = useNavigate();
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Group courses by category
  const coursesByCategory = courses?.reduce((acc: Record<string, typeof courses>, course) => {
    const category = course.category || "Other Courses";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(course);
    return acc;
  }, {} as Record<string, typeof courses>);

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
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        ) : !courses || courses.length === 0 ? (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-muted-foreground">No courses available at the moment.</h2>
            </div>
        ) : (
            Object.keys(coursesByCategory || {}).map((category) => (
            <div key={category} className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesByCategory[category].map((course) => (
                    <Card 
                    key={course.id} 
                    className="shadow-elevated hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => navigate(`/course/${course.id}`)}
                    >
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary-foreground" />
                        </div>
                        </div>
                        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                        <CardDescription>
                        {category}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {course.description}
                        </p>
                        <Button className="w-full min-h-[44px]">View Details & Enroll</Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </div>
            ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
