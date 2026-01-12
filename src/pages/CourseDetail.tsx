import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Users, Award, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", courseId)
            .single();
        if (error) throw error;
        return data;
    },
    enabled: !!courseId,
  });

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data, error } = await supabase
            .from("enrollments")
            .select("*")
            .eq("course_id", courseId)
            .eq("student_id", user.id)
            .maybeSingle();
            
        if (error) throw error;
        return data;
    },
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please sign in to enroll");
        
        const { error } = await supabase
            .from("enrollments")
            .insert([{
                course_id: courseId,
                student_id: user.id
            }]);
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
        toast({
            title: "Enrollment Successful",
            description: `You have been enrolled in ${course?.title}`,
        });
    },
    onError: (error) => {
        if (error.message.includes("Please sign in")) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to enroll in courses",
                variant: "destructive"
            });
            navigate("/auth");
        } else {
            toast({
                title: "Enrollment Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    }
  });

  if (courseLoading || enrollmentLoading) {
      return (
          <div className="min-h-screen bg-background flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  if (!course) {
      return (
          <div className="min-h-screen bg-background">
              <Navbar />
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-2xl font-bold">Course not found</h1>
                  <Button variant="outline" className="mt-4" onClick={() => navigate("/courses")}>
                      Back to Courses
                  </Button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate("/courses")}
          className="mb-6 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="p-3 bg-primary rounded-lg w-fit">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl break-words">{course.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {course.category || "Professional intelligence and security training"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Course Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                  {course.full_description && (
                    <p className="text-muted-foreground leading-relaxed mt-4">
                        {course.full_description}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Learning Objectives</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Develop comprehensive understanding of intelligence principles and practices</li>
                    <li>Master analytical techniques and methodologies</li>
                    <li>Enhance critical thinking and decision-making skills</li>
                    <li>Understand ethical and legal frameworks</li>
                    <li>Build effective communication and reporting capabilities</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="shadow-elevated sticky top-24">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">12 Weeks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Class Size</p>
                      <p className="text-sm text-muted-foreground">Limited Seats</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Certificate</p>
                      <p className="text-sm text-muted-foreground">Upon Completion</p>
                    </div>
                  </div>
                </div>

                {enrollment ? (
                    <Button 
                        className="w-full h-12 text-lg font-semibold"
                        onClick={() => navigate(`/course/${courseId}/learn`)}
                    >
                        Go to Course
                    </Button>
                ) : (
                    <Button 
                        className="w-full h-12 text-lg font-semibold" 
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                    >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                    </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;