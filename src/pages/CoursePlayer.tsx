import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, PlayCircle, CheckCircle, FileText, ArrowLeft, Video, FileQuestion } from "lucide-react";
import { QuizPlayer } from "@/components/QuizPlayer";
import { toast } from "sonner";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Fetch course details
  const { data: course } = useQuery({
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

  // Fetch lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch quizzes
  const { data: quizzes } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdminByProfile = profile?.role === "admin";
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      const isAdminByRoles = !!roleData;
      const userIsAdmin = isAdminByProfile || isAdminByRoles;

      if (userIsAdmin) {
        setHasAccess(true);
        setCheckingEnrollment(false);
        return;
      }

      if (!courseId) {
        setCheckingEnrollment(false);
        return;
      }

      if (profile?.role === "instructor") {
        const { data: courseRow, error } = await supabase
          .from("courses")
          .select("instructor_id")
          .eq("id", courseId)
          .maybeSingle();
        if (error) throw error;

        if (courseRow?.instructor_id !== user.id) {
          toast.error("You do not have permission to view this course content.");
          navigate("/instructor");
          return;
        }

        setHasAccess(true);
        setCheckingEnrollment(false);
        return;
      }

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", user.id)
        .maybeSingle();

      if (!enrollment) {
        toast.error("You must be enrolled in this course to view content.");
        navigate(`/course/${courseId}`);
        return;
      }

      setHasAccess(true);
      setCheckingEnrollment(false);
    };

    checkAccess();
  }, [courseId, navigate]);

  // Set first lesson or quiz as active by default
  useEffect(() => {
    if (!activeLessonId && !activeQuizId) {
      if (lessons && lessons.length > 0) {
        setActiveLessonId(lessons[0].id);
      } else if (quizzes && quizzes.length > 0) {
        setActiveQuizId(quizzes[0].id);
      }
    }
  }, [lessons, quizzes, activeLessonId, activeQuizId]);

  const activeLesson = lessons?.find((l: { id: string }) => l.id === activeLessonId);

  const LessonList = () => (
    <div className="py-4">
      <h3 className="px-4 text-lg font-semibold mb-4">Course Content</h3>
      
      {/* Lessons Section */}
      <div className="mb-6">
        <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lessons</h4>
        <div className="space-y-1">
          {lessons?.map((lesson: { id: string; title: string; video_url: string | null }, index: number) => (
            <Button
              key={lesson.id}
              variant={activeLessonId === lesson.id ? "secondary" : "ghost"}
              className="w-full justify-start px-4 py-6 h-auto whitespace-normal text-left"
              onClick={() => {
                setActiveLessonId(lesson.id);
                setActiveQuizId(null);
                setIsSidebarOpen(false);
              }}
            >
              <div className="flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{lesson.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {lesson.video_url ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    <span>{lesson.video_url ? "Video" : "Reading"}</span>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Quizzes Section */}
      {quizzes && quizzes.length > 0 && (
        <div>
          <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quizzes</h4>
          <div className="space-y-1">
            {quizzes.map((quiz, index) => (
              <Button
                key={quiz.id}
                variant={activeQuizId === quiz.id ? "secondary" : "ghost"}
                className="w-full justify-start px-4 py-6 h-auto whitespace-normal text-left"
                onClick={() => {
                  setActiveQuizId(quiz.id);
                  setActiveLessonId(null);
                  setIsSidebarOpen(false);
                }}
              >
                <div className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-medium shrink-0 mt-0.5">
                    Q{index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{quiz.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <FileQuestion className="h-3 w-3" />
                      <span>Quiz</span>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (lessonsLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading course content...</div>;
  }

  if (checkingEnrollment || !hasAccess) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Checking course access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-80 shrink-0">
          <Card className="h-[calc(100vh-140px)] sticky top-24">
            <ScrollArea className="h-full">
              <LessonList />
            </ScrollArea>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            
            {/* Mobile Sidebar Trigger */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="mr-2 h-4 w-4" /> Course Content
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <ScrollArea className="h-full">
                  <LessonList />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          <Card className="min-h-[500px]">
            <CardContent className="p-6">
              {activeLesson ? (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{activeLesson.title}</h1>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                  </div>

                  {activeLesson.video_url && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                      <iframe 
                        src={activeLesson.video_url.replace("watch?v=", "embed/")} 
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="prose max-w-none dark:prose-invert">
                    {activeLesson.content?.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="pt-8 flex justify-between">
                    <Button 
                      variant="outline"
                      disabled={lessons?.indexOf(activeLesson) === 0}
                      onClick={() => {
                        const idx = lessons?.indexOf(activeLesson) || 0;
                        if (idx > 0) setActiveLessonId(lessons![idx - 1].id);
                      }}
                    >
                      Previous Lesson
                    </Button>
                    <Button 
                      onClick={() => {
                        const idx = lessons?.indexOf(activeLesson) || 0;
                        if (lessons && idx < lessons.length - 1) {
                          setActiveLessonId(lessons[idx + 1].id);
                        } else {
                          // Try to move to first quiz if available
                          if (quizzes && quizzes.length > 0) {
                            setActiveLessonId(null);
                            setActiveQuizId(quizzes[0].id);
                            toast.success("Lessons completed! Starting quizzes.");
                          } else {
                            toast.success("Course completed!");
                          }
                        }
                      }}
                    >
                      {lessons && lessons.indexOf(activeLesson) === lessons.length - 1 
                        ? (quizzes && quizzes.length > 0 ? "Take Quiz" : "Complete Course") 
                        : "Next Lesson"}
                    </Button>
                  </div>
                </div>
              ) : activeQuizId ? (
                <QuizPlayer quizId={activeQuizId} onComplete={(score, total) => {
                  if (score >= 70) {
                      toast.success(`Quiz passed with score ${score}%!`);
                      // Find current quiz index
                      const idx = quizzes?.findIndex(q => q.id === activeQuizId) || 0;
                      if (quizzes && idx < quizzes.length - 1) {
                          // Move to next quiz
                          setActiveQuizId(quizzes[idx+1].id);
                      } else {
                          toast.success("All quizzes completed!");
                      }
                  } else {
                      toast.warning(`Quiz finished with score ${score}%. Try again to pass.`);
                  }
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Select a lesson to start learning</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
