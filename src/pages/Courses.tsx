import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

const Courses = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          profiles:instructor_id (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Available Courses</h1>
          <p className="text-muted-foreground text-lg">
            Explore our comprehensive intelligence and security training programs
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : courses && courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="shadow-elevated hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    Instructor: {(course.profiles as any)?.full_name || "Unknown"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {course.description || "No description available"}
                  </p>
                  <Button className="w-full">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Courses;
