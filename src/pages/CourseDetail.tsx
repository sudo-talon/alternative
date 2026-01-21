import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";
import { BookOpen, Calendar, Users, Award, ArrowLeft, CreditCard, Clock } from "lucide-react";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"];

const CourseDetail = () => {
  const { courseTitle } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentRow | null>(null);

  const courseIdentifier = courseTitle || "";
  const decodedIdentifier = decodeURIComponent(courseIdentifier);

  const { data: course, isLoading: courseLoading } = useQuery<CourseRow | null>({
    queryKey: ["course-detail", courseIdentifier],
    queryFn: async () => {
      if (!courseIdentifier) return null;
      const { data: byId, error: byIdError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseIdentifier)
        .maybeSingle();
      if (!byIdError && byId) return byId as CourseRow;

      const { data: byTitle, error: byTitleError } = await supabase
        .from("courses")
        .select("*")
        .ilike("title", decodedIdentifier);
      if (byTitleError) throw byTitleError;
      return (byTitle && byTitle.length > 0 ? byTitle[0] : null) as CourseRow | null;
    },
  });

  const checkEnrollment = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user || !course) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (!error && data) {
      setEnrollment(data as EnrollmentRow);
      setIsEnrolled(true);
    } else {
      setEnrollment(null);
      setIsEnrolled(false);
    }

    setLoading(false);
  }, [course]);

  useEffect(() => {
    if (course) {
      checkEnrollment();
    }
  }, [course, checkEnrollment]);

  

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses",
      });
      navigate("/auth");
      return;
    }

    if (!course) {
      toast({
        title: "Error",
        description: "Course details could not be loaded",
      });
      return;
    }

    try {
      setLoading(true);
      // Simple enrollment (no payments table exists)
      const { error: enrollmentError } = await supabase.from("enrollments").insert([
        {
          student_id: user.id,
          course_id: course.id,
        },
      ]);
      if (enrollmentError) throw enrollmentError;

      toast({
        title: "Enrollment Successful",
        description: `You have been enrolled in ${course.title}`,
      });
      await checkEnrollment();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("duplicate key")) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this course",
        });
      } else {
        toast({
          title: "Enrollment failed",
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const decodedTitle = decodedIdentifier;
  const titleToShow = course?.title || decodedTitle;
  const isPaidCourse = false; // Payment features not enabled
  const hasActiveAccess = isEnrolled;
  const showLoadingState = loading || courseLoading;

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

        {showLoadingState && (
          <div className="mb-6 text-center text-muted-foreground">Loading course...</div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="p-3 bg-primary rounded-lg w-fit">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl break-words flex flex-wrap items-center gap-2">
                      <span>{titleToShow}</span>
                      {course && (
                        <Badge variant={isPaidCourse ? "secondary" : "outline"} className="text-xs">
                          {isPaidCourse ? "Paid" : "Free"}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {course?.description || "Professional intelligence and security training"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Course Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This comprehensive course is designed to equip participants with essential knowledge 
                    and practical skills in intelligence and security operations. Through a combination of 
                    theoretical instruction and hands-on training, students will develop the competencies 
                    required for effective performance in their respective roles.
                  </p>
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

                <div>
                  <h3 className="text-xl font-semibold mb-3">Course Content</h3>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Module 1: Fundamentals</h4>
                      <p className="text-sm text-muted-foreground">
                        Introduction to core concepts and principles
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Module 2: Advanced Techniques</h4>
                      <p className="text-sm text-muted-foreground">
                        Advanced methodologies and practical applications
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Module 3: Practical Exercises</h4>
                      <p className="text-sm text-muted-foreground">
                        Hands-on training and scenario-based learning
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p className="text-sm text-muted-foreground">8-12 weeks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Class Size</p>
                    <p className="text-sm text-muted-foreground">20-30 students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Estimated Duration</p>
                    <p className="text-sm text-muted-foreground">
                      8-12 weeks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Pricing</p>
                    <p className="text-sm text-muted-foreground">Free</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Certification</p>
                    <p className="text-sm text-muted-foreground">DIC Certificate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevated bg-gradient-accent">
              <CardContent className="pt-6">
                {showLoadingState ? (
                  <Button className="w-full" disabled>
                    Loading...
                  </Button>
                ) : isEnrolled ? (
                  <div className="text-center">
                    <p className="text-primary-foreground font-semibold mb-4">
                      {hasActiveAccess
                        ? "You are enrolled in this course"
                        : "Your access to this course is currently revoked"}
                    </p>
                    {hasActiveAccess && (
                      <Button
                        variant="secondary"
                        className="w-full min-h-[44px]"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Course Dashboard
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-primary-foreground text-center mb-4">
                      {isPaidCourse
                        ? "Complete your enrollment to unlock course content."
                        : "Ready to advance your career?"}
                    </p>
                    <Button 
                      onClick={handleEnroll} 
                      className="w-full bg-white text-primary hover:bg-white/90 min-h-[44px]"
                    >
                      {isPaidCourse
                        ? "Enroll - Premium Course"
                        : "Enroll Now"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="text-lg">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Valid identification</li>
                  <li>• Security clearance (where applicable)</li>
                  <li>• Educational qualifications as per course requirements</li>
                  <li>• Physical fitness standards</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
