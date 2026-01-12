import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Plus, Save, Trash, ArrowLeft, Video, FileText, HelpCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { QuizQuestionsEditor } from "@/components/QuizQuestionsEditor";
import type { Database } from "@/integrations/supabase/types";

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  
  // Lessons state
  type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    video_url: "",
  });

  // Quizzes state
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
  });

  // Fetch course details
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

  // Fetch lessons
  const { data: lessons, isLoading: lessonsLoading } = useQuery<LessonRow[]>({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      
      if (error) {
        // If table doesn't exist yet or other error, return empty array
        console.error("Error fetching lessons:", error);
        return [];
      }
      return (data as LessonRow[]) || [];
    },
    enabled: !!courseId,
  });

  // Fetch quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching quizzes:", error);
        return [];
      }
      return data;
    },
    enabled: !!courseId,
  });

  // Check permissions
  useEffect(() => {
    if (course) {
      const checkPermission = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        
        // Check if admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        const isAdminByProfile = profile?.role === "admin";
        if (isAdminByProfile) return;
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) return;

        // Check if instructor of this course
        if (course.instructor_id !== user.id) {
          toast.error("You do not have permission to edit this course.");
          navigate("/instructor");
        }
      };
      checkPermission();
    }
  }, [course, navigate]);

  const updateCourseMutation = useMutation({
    mutationFn: async (updatedData: Partial<{
      title: string;
      description: string | null;
      full_description: string | null;
      category: string | null;
    }>) => {
      const { error } = await supabase
        .from("courses")
        .update(updatedData)
        .eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lessonData: typeof newLesson) => {
      // Get max order index
      const maxOrder = lessons?.length ? Math.max(...lessons.map(l => l.order_index)) : -1;
      
      const { error } = await supabase
        .from("lessons")
        .insert([{
          course_id: courseId,
          title: lessonData.title,
          content: lessonData.content,
          video_url: lessonData.video_url,
          order_index: maxOrder + 1,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      setCreateLessonOpen(false);
      setNewLesson({ title: "", content: "", video_url: "" });
      toast.success("Lesson created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create lesson: ${error.message}`);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-lessons", courseId] });
      toast.success("Lesson deleted");
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: typeof newQuiz) => {
      const { error } = await supabase
        .from("quizzes")
        .insert([{
          course_id: courseId,
          title: quizData.title,
          description: quizData.description,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      setCreateQuizOpen(false);
      setNewQuiz({ title: "", description: "" });
      toast.success("Quiz created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create quiz: ${error.message}`);
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-quizzes", courseId] });
      toast.success("Quiz deleted");
    },
  });

  if (courseLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!course) {
    return <div className="flex justify-center items-center min-h-screen">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/instructor")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">Manage course content and settings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Update basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    defaultValue={course.title}
                    onBlur={(e) => updateCourseMutation.mutate({ title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input 
                    id="edit-category" 
                    defaultValue={course.category || ""}
                    onBlur={(e) => updateCourseMutation.mutate({ category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    className="min-h-[100px]"
                    defaultValue={course.description || ""}
                    onBlur={(e) => updateCourseMutation.mutate({ description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-full-description">Full Description</Label>
                  <Textarea 
                    id="edit-full-description" 
                    className="min-h-[200px]"
                    defaultValue={course.full_description || ""}
                    onBlur={(e) => updateCourseMutation.mutate({ full_description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Course Lessons</h2>
              <Dialog open={createLessonOpen} onOpenChange={setCreateLessonOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson-title">Lesson Title</Label>
                      <Input 
                        id="lesson-title" 
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lesson-video">Video URL (Optional)</Label>
                      <Input 
                        id="lesson-video" 
                        placeholder="https://..."
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lesson-content">Content</Label>
                      <Textarea 
                        id="lesson-content" 
                        className="min-h-[200px]"
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => createLessonMutation.mutate(newLesson)}>
                      Create Lesson
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {lessonsLoading ? (
              <div>Loading lessons...</div>
            ) : lessons?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No lessons added yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {lessons?.map((lesson: LessonRow) => (
                  <AccordionItem key={lesson.id} value={lesson.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {lesson.order_index + 1}
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-4 space-y-4">
                      {lesson.video_url && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Video className="h-4 w-4" />
                          <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Video Resource
                          </a>
                        </div>
                      )}
                      <div className="prose max-w-none text-sm text-muted-foreground">
                        {lesson.content}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if(confirm("Delete this lesson?")) deleteLessonMutation.mutate(lesson.id)
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Delete Lesson
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="quizzes">
            {selectedQuizId ? (
              <QuizQuestionsEditor 
                quizId={selectedQuizId} 
                onBack={() => setSelectedQuizId(null)} 
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Course Quizzes</h2>
                  <Dialog open={createQuizOpen} onOpenChange={setCreateQuizOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Quiz</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="quiz-title">Quiz Title</Label>
                          <Input 
                            id="quiz-title" 
                            value={newQuiz.title}
                            onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiz-description">Description</Label>
                          <Textarea 
                            id="quiz-description" 
                            value={newQuiz.description}
                            onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => createQuizMutation.mutate(newQuiz)}>
                          Create Quiz
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {quizzesLoading ? (
                  <div>Loading quizzes...</div>
                ) : quizzes?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No quizzes added yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {quizzes?.map((quiz: { id: string; title: string; description: string | null }) => (
                      <Card key={quiz.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {quiz.title}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedQuizId(quiz.id)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Questions
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm("Delete this quiz?")) deleteQuizMutation.mutate(quiz.id);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mt-2">{quiz.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseEditor;
