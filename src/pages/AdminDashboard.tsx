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
import { Newspaper, Trash2, Plus, BookOpen, Users, GraduationCap, Edit, BarChart3, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(85, 25%, 35%)', 'hsl(85, 25%, 45%)', 'hsl(85, 25%, 55%)', 'hsl(85, 25%, 65%)'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseFullDescription, setCourseFullDescription] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

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
      .maybeSingle();

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

  // Fetch all data
  const { data: news } = useQuery({
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

  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, profiles:instructor_id(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_categories(name), enrollments(course_id, courses(title))")
        .eq("role", "student")
        .order("created_at", { ascending: false});
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: instructors } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, courses(title)")
        .eq("role", "instructor")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: categories } = useQuery({
    queryKey: ["student-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: enrollmentAnalytics } = useQuery({
    queryKey: ["enrollment-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollment_analytics")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: categoryAnalytics } = useQuery({
    queryKey: ["category-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_analytics")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Mutations
  const createNewsMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase
        .from("news")
        .insert([{ title, content }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast({ 
        title: "Success", 
        description: "News created and notifications sent automatically" 
      });
      setNewsTitle("");
      setNewsContent("");
      setTargetCategory("");
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast({ title: "News deleted successfully" });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (course: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("courses")
        .insert([{ ...course, instructor_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course created successfully" });
      resetCourseForm();
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
      toast({ title: "Course updated successfully" });
      resetCourseForm();
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Course deleted successfully" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const { error } = await supabase
        .from("student_categories")
        .insert([{ name, description }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-categories"] });
      toast({ title: "Category created successfully" });
      setNewCategoryName("");
      setNewCategoryDescription("");
    },
  });

  const assignStudentToCategoryMutation = useMutation({
    mutationFn: async ({ studentId, categoryId }: { studentId: string; categoryId: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ category_id: categoryId })
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      toast({ title: "Student assigned to category" });
    },
  });

  const enrollStudentMutation = useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      const { error } = await supabase
        .from("enrollments")
        .insert([{ student_id: studentId, course_id: courseId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment-analytics"] });
      toast({ title: "Student enrolled in course" });
      setSelectedStudentId("");
      setSelectedCourseId("");
    },
  });

  // Helper functions
  const resetCourseForm = () => {
    setCourseTitle("");
    setCourseDescription("");
    setCourseCategory("");
    setCourseFullDescription("");
    setEditingCourse(null);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description || "");
    setCourseCategory(course.category || "");
    setCourseFullDescription(course.full_description || "");
  };

  const handleCreateNews = async () => {
    if (!newsTitle || !newsContent) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    
    // Create news (notifications will be sent automatically via database trigger)
    createNewsMutation.mutate({ title: newsTitle, content: newsContent });
    
    // Optionally send to specific category if selected
    if (targetCategory && targetCategory !== "all") {
      const { error } = await supabase.rpc("send_notification_to_users", {
        p_title: `Category Announcement: ${newsTitle}`,
        p_message: newsContent,
        p_type: "announcement",
        p_category_id: targetCategory,
      });

      if (error) {
        console.error("Error sending category notifications:", error);
      }
    }
  };

  const handleCreateCourse = () => {
    if (!courseTitle) {
      toast({ title: "Please enter course title", variant: "destructive" });
      return;
    }

    if (editingCourse) {
      updateCourseMutation.mutate({
        id: editingCourse.id,
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        full_description: courseFullDescription,
      });
    } else {
      createCourseMutation.mutate({
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        full_description: courseFullDescription,
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Users className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="students">
              <GraduationCap className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="instructors">
              <Users className="mr-2 h-4 w-4" />
              Instructors
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment by Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={enrollmentAnalytics || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course_title" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total_enrollments" fill="hsl(85, 25%, 35%)" name="Enrollments" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Students by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryAnalytics || []}
                        dataKey="student_count"
                        nameKey="category_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(categoryAnalytics || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{students?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{courses?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Instructors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{instructors?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{categories?.length || 0}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="News Title"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="News Content"
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    rows={5}
                  />
                  <Select value={targetCategory} onValueChange={setTargetCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Target audience (optional - defaults to all)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} Category Only
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateNews}>
                    <Plus className="mr-2 h-4 w-4" />
                    Publish News & Notify Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Published News</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {news?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteNewsMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingCourse ? "Edit Course" : "Create Course"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Course Title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Category"
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                  />
                  <Textarea
                    placeholder="Short Description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    rows={3}
                  />
                  <Textarea
                    placeholder="Full Description"
                    value={courseFullDescription}
                    onChange={(e) => setCourseFullDescription(e.target.value)}
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCourse}>
                      {editingCourse ? "Update Course" : "Create Course"}
                    </Button>
                    {editingCourse && (
                      <Button variant="outline" onClick={resetCourseForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses?.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.profiles?.full_name}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCourseMutation.mutate(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Student Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={() => {
                      if (!newCategoryName) {
                        toast({ title: "Please enter category name", variant: "destructive" });
                        return;
                      }
                      createCategoryMutation.mutate({
                        name: newCategoryName,
                        description: newCategoryDescription,
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Manage Students</CardTitle>
                <CardDescription>Assign students to categories and enroll in courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enroll Student in Course</label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course</label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="md:col-span-2"
                    onClick={() => {
                      if (!selectedStudentId || !selectedCourseId) {
                        toast({ title: "Please select both student and course", variant: "destructive" });
                        return;
                      }
                      enrollStudentMutation.mutate({
                        studentId: selectedStudentId,
                        courseId: selectedCourseId,
                      });
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Enroll Student
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Assign Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students?.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.student_categories ? (
                            <Badge>{student.student_categories.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.enrollments?.length || 0} courses
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(categoryId) =>
                              assignStudentToCategoryMutation.mutate({
                                studentId: student.id,
                                categoryId,
                              })
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors">
            <Card>
              <CardHeader>
                <CardTitle>Instructors</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Courses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors?.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>{instructor.full_name}</TableCell>
                        <TableCell>{instructor.email}</TableCell>
                        <TableCell>{instructor.courses?.length || 0} courses</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;