import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trash2, Plus, BookOpen, Users, GraduationCap, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseFullDescription, setCourseFullDescription] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false});
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: instructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "instructor")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const createNewsMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase
        .from("news")
        .insert({ title, content });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      setNewsTitle("");
      setNewsContent("");
      toast({
        title: "Success",
        description: "News article created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast({
        title: "Success",
        description: "News article deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (course: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("courses")
        .insert({ ...course, instructor_id: user?.id });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setCourseTitle("");
      setCourseDescription("");
      setCourseCategory("");
      setCourseFullDescription("");
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...course }: any) => {
      const { error } = await supabase
        .from("courses")
        .update(course)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setEditingCourse(null);
      setCourseTitle("");
      setCourseDescription("");
      setCourseCategory("");
      setCourseFullDescription("");
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createNewsMutation.mutate({ title: newsTitle, content: newsContent });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDescription.trim() || !courseCategory.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      category: courseCategory,
      full_description: courseFullDescription,
    };

    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, ...courseData });
    } else {
      createCourseMutation.mutate(courseData);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description || "");
    setCourseCategory(course.category || "");
    setCourseFullDescription(course.full_description || "");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage DIC Portal</p>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-primary/20">
            <TabsTrigger value="news"><Newspaper className="h-4 w-4 mr-2" />News</TabsTrigger>
            <TabsTrigger value="courses"><BookOpen className="h-4 w-4 mr-2" />Courses</TabsTrigger>
            <TabsTrigger value="instructors"><GraduationCap className="h-4 w-4 mr-2" />Instructors</TabsTrigger>
            <TabsTrigger value="students"><Users className="h-4 w-4 mr-2" />Students</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-elevated border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create News Article
                  </CardTitle>
                  <CardDescription>Add breaking news to the homepage</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateNews} className="space-y-4">
                    <Input
                      placeholder="News title"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="News content"
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      rows={4}
                    />
                    <Button type="submit" className="w-full" disabled={createNewsMutation.isPending}>
                      {createNewsMutation.isPending ? "Creating..." : "Create News"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    Manage News Articles
                  </CardTitle>
                  <CardDescription>View and delete existing news</CardDescription>
                </CardHeader>
                <CardContent>
                  {newsLoading ? (
                    <p className="text-center text-muted-foreground">Loading news...</p>
                  ) : news && news.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {news.map((item) => (
                        <div key={item.id} className="p-3 border border-primary/20 rounded-lg flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteNewsMutation.mutate(item.id)}
                            disabled={deleteNewsMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No news articles found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <div className="grid gap-6">
              <Card className="shadow-elevated border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {editingCourse ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {editingCourse ? "Edit Course" : "Create Course"}
                  </CardTitle>
                  <CardDescription>Manage DIC courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <Input
                      placeholder="Course title"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                    <Select value={courseCategory} onValueChange={setCourseCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Generic">Generic Courses</SelectItem>
                        <SelectItem value="Specialized">Specialized Courses</SelectItem>
                        <SelectItem value="Language">Language Courses</SelectItem>
                        <SelectItem value="Strategic">Strategic Courses</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Short description"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      placeholder="Full description"
                      value={courseFullDescription}
                      onChange={(e) => setCourseFullDescription(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                        {editingCourse ? "Update Course" : "Create Course"}
                      </Button>
                      {editingCourse && (
                        <Button type="button" variant="outline" onClick={() => {
                          setEditingCourse(null);
                          setCourseTitle("");
                          setCourseDescription("");
                          setCourseCategory("");
                          setCourseFullDescription("");
                        }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-elevated border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    All Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {coursesLoading ? (
                    <p className="text-center text-muted-foreground">Loading courses...</p>
                  ) : courses && courses.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.category}</TableCell>
                            <TableCell className="max-w-md truncate">{course.description}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditCourse(course)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteCourseMutation.mutate(course.id)}
                                  disabled={deleteCourseMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground">No courses found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="instructors" className="mt-6">
            <Card className="shadow-elevated border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Instructors
                </CardTitle>
                <CardDescription>Manage instructor accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {instructorsLoading ? (
                  <p className="text-center text-muted-foreground">Loading instructors...</p>
                ) : instructors && instructors.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instructors.map((instructor) => (
                        <TableRow key={instructor.id}>
                          <TableCell className="font-medium">{instructor.full_name}</TableCell>
                          <TableCell>{instructor.email}</TableCell>
                          <TableCell>{new Date(instructor.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground">No instructors found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card className="shadow-elevated border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students
                </CardTitle>
                <CardDescription>Manage student accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <p className="text-center text-muted-foreground">Loading students...</p>
                ) : students && students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground">No students found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
