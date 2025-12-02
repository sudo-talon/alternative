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
import { Newspaper, Trash2, Plus, Users, GraduationCap, Edit, BarChart3, Shield, BookOpen, UserCog, Crown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['hsl(85, 25%, 35%)', 'hsl(85, 25%, 45%)', 'hsl(85, 25%, 55%)', 'hsl(85, 25%, 65%)'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // News state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  
  // Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  
  // User management state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserCategory, setSelectedUserCategory] = useState("");

  // Personnel state
  const [personnelForm, setPersonnelForm] = useState({
    full_name: "", email: "", phone: "", category: "civilian", position: "", department: "", rank: "", bio: "", photo_url: ""
  });
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);

  // Leadership state
  const [leadershipForm, setLeadershipForm] = useState({
    full_name: "", position: "", rank: "", bio: "", photo_url: "", display_order: 0
  });
  const [editingLeadershipId, setEditingLeadershipId] = useState<string | null>(null);

  // PG Programs state
  const [pgProgramForm, setPgProgramForm] = useState({
    department: "", degree_types: "", specializations: "", requirements: "", display_order: 0
  });
  const [editingPgProgramId, setEditingPgProgramId] = useState<string | null>(null);
  const [pgProgramDialogOpen, setPgProgramDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("No user found, redirecting to auth");
        navigate("/auth");
        return;
      }

      console.log("Checking admin status for user:", user.id);

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      console.log("Role check result:", roles, roleError);

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
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Queries and mutations
  const createNewsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("news")
        .insert([{ title: newsTitle, content: newsContent }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setNewsTitle("");
      setNewsContent("");
      toast({ title: "Success", description: "News created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast({ title: "Success", description: "News deleted successfully" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("student_categories")
        .insert([{ name: newCategoryName, description: newCategoryDescription }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-categories"] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("student_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // First delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Then insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role }]);
      if (error) throw error;

      // Update profile role
      await supabase
        .from("profiles")
        .update({ role: role as any })
        .eq("id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserCategoryMutation = useMutation({
    mutationFn: async ({ userId, categoryId }: { userId: string; categoryId: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ category_id: categoryId })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Success", description: "User category updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_categories(name)")
        .order("created_at", { ascending: false });
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
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: personnel } = useQuery({
    queryKey: ["admin-personnel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: leadership } = useQuery({
    queryKey: ["admin-leadership"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leadership")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

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

  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data: categoryAnalytics, error: catError } = await supabase
        .from("category_analytics")
        .select("*");
      
      if (catError) throw catError;
      return categoryAnalytics;
    },
    enabled: isAdmin,
  });

  const { data: pgPrograms } = useQuery({
    queryKey: ["admin-pg-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pg_programs")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast({ title: "Success", description: "Course deleted" });
    },
  });

  const createPersonnelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("personnel").insert([personnelForm]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personnel"] });
      setPersonnelForm({ full_name: "", email: "", phone: "", category: "civilian", position: "", department: "", rank: "", bio: "", photo_url: "" });
      toast({ title: "Success", description: "Personnel created" });
    },
  });

  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personnel"] });
      toast({ title: "Success", description: "Personnel deleted" });
    },
  });

  const createLeadershipMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leadership").insert([leadershipForm]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
      setLeadershipForm({ full_name: "", position: "", rank: "", bio: "", photo_url: "", display_order: 0 });
      toast({ title: "Success", description: "Leadership created" });
    },
  });

  const deleteLeadershipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leadership").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
      toast({ title: "Success", description: "Leadership deleted" });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all aspects of the platform</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Shield className="mr-2 h-5 w-5" />
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 gap-1">
            <TabsTrigger value="courses"><BookOpen className="mr-1 h-4 w-4" />Courses</TabsTrigger>
            <TabsTrigger value="personnel"><UserCog className="mr-1 h-4 w-4" />Personnel</TabsTrigger>
            <TabsTrigger value="leadership"><Crown className="mr-1 h-4 w-4" />Leadership</TabsTrigger>
            <TabsTrigger value="pgprograms"><GraduationCap className="mr-1 h-4 w-4" />PG Programs</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="mr-1 h-4 w-4" />News</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="categories"><Shield className="mr-1 h-4 w-4" />Categories</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="mr-1 h-4 w-4" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage all courses created by instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses?.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.profiles?.full_name}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(`/course/${course.title}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteCourseMutation.mutate(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personnel">
            <Card>
              <CardHeader>
                <CardTitle>Personnel Management</CardTitle>
                <CardDescription>Manage civilian and military personnel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Add Personnel</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Personnel</DialogTitle>
                      <DialogDescription>Enter personnel details below</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="p_name">Full Name</Label>
                        <Input id="p_name" value={personnelForm.full_name} onChange={(e) => setPersonnelForm({...personnelForm, full_name: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_email">Email</Label>
                        <Input id="p_email" type="email" value={personnelForm.email} onChange={(e) => setPersonnelForm({...personnelForm, email: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_phone">Phone</Label>
                        <Input id="p_phone" value={personnelForm.phone} onChange={(e) => setPersonnelForm({...personnelForm, phone: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_category">Category</Label>
                        <Select value={personnelForm.category} onValueChange={(value) => setPersonnelForm({...personnelForm, category: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="civilian">Civilian</SelectItem>
                            <SelectItem value="military">Military</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_position">Position</Label>
                        <Input id="p_position" value={personnelForm.position} onChange={(e) => setPersonnelForm({...personnelForm, position: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_department">Department</Label>
                        <Input id="p_department" value={personnelForm.department} onChange={(e) => setPersonnelForm({...personnelForm, department: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_rank">Rank</Label>
                        <Input id="p_rank" value={personnelForm.rank} onChange={(e) => setPersonnelForm({...personnelForm, rank: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_bio">Bio</Label>
                        <Textarea id="p_bio" value={personnelForm.bio} onChange={(e) => setPersonnelForm({...personnelForm, bio: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="p_photo">Photo URL</Label>
                        <Input id="p_photo" value={personnelForm.photo_url} onChange={(e) => setPersonnelForm({...personnelForm, photo_url: e.target.value})} />
                      </div>
                      <Button onClick={() => createPersonnelMutation.mutate()}>Create Personnel</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnel?.map((person: any) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.full_name}</TableCell>
                        <TableCell><Badge>{person.category}</Badge></TableCell>
                        <TableCell>{person.position}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => deletePersonnelMutation.mutate(person.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leadership">
            <Card>
              <CardHeader>
                <CardTitle>Leadership Management</CardTitle>
                <CardDescription>Manage leadership profiles and hierarchy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Add Leader</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Leader</DialogTitle>
                      <DialogDescription>Enter leadership details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="l_name">Full Name</Label>
                        <Input id="l_name" value={leadershipForm.full_name} onChange={(e) => setLeadershipForm({...leadershipForm, full_name: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_position">Position</Label>
                        <Input id="l_position" value={leadershipForm.position} onChange={(e) => setLeadershipForm({...leadershipForm, position: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_rank">Rank</Label>
                        <Input id="l_rank" value={leadershipForm.rank} onChange={(e) => setLeadershipForm({...leadershipForm, rank: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_bio">Bio</Label>
                        <Textarea id="l_bio" value={leadershipForm.bio} onChange={(e) => setLeadershipForm({...leadershipForm, bio: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_photo">Photo URL</Label>
                        <Input id="l_photo" value={leadershipForm.photo_url} onChange={(e) => setLeadershipForm({...leadershipForm, photo_url: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_order">Display Order</Label>
                        <Input id="l_order" type="number" value={leadershipForm.display_order} onChange={(e) => setLeadershipForm({...leadershipForm, display_order: parseInt(e.target.value)})} />
                      </div>
                      <Button onClick={() => createLeadershipMutation.mutate()}>Create Leader</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadership?.map((leader: any) => (
                      <TableRow key={leader.id}>
                        <TableCell>{leader.display_order}</TableCell>
                        <TableCell className="font-medium">{leader.full_name}</TableCell>
                        <TableCell>{leader.position}</TableCell>
                        <TableCell>{leader.rank}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => deleteLeadershipMutation.mutate(leader.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>News Management</CardTitle>
                <CardDescription>Create and manage news announcements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="news_title">Title</Label>
                    <Input id="news_title" placeholder="News title" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="news_content">Content</Label>
                    <Textarea id="news_content" placeholder="News content" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={4} />
                  </div>
                  <Button onClick={() => createNewsMutation.mutate()} disabled={!newsTitle || !newsContent}>
                    <Plus className="mr-2 h-4 w-4" />Create News
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{new Date(item.published_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => deleteNewsMutation.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select value={user.role} onValueChange={(value) => updateUserRoleMutation.mutate({ userId: user.id, role: value })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="instructor">Instructor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={user.category_id || ""} onValueChange={(value) => updateUserCategoryMutation.mutate({ userId: user.id, categoryId: value || null })}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {categories?.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Manage student categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cat_name">Category Name</Label>
                    <Input id="cat_name" placeholder="e.g., Military Officers" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cat_desc">Description</Label>
                    <Textarea id="cat_desc" placeholder="Category description" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} />
                  </div>
                  <Button onClick={() => createCategoryMutation.mutate()} disabled={!newCategoryName}>
                    <Plus className="mr-2 h-4 w-4" />Create Category
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((category: any) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pgprograms">
            <Card>
              <CardHeader>
                <CardTitle>PG Programs Management</CardTitle>
                <CardDescription>Manage postgraduate programme offerings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button onClick={() => {
                  setPgProgramForm({ department: "", degree_types: "", specializations: "", requirements: "", display_order: 0 });
                  setEditingPgProgramId(null);
                  setPgProgramDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />Add PG Program
                </Button>

                <Dialog open={pgProgramDialogOpen} onOpenChange={setPgProgramDialogOpen}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPgProgramId ? "Edit" : "Add New"} PG Program</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Department Name</Label>
                        <Input
                          value={pgProgramForm.department}
                          onChange={(e) => setPgProgramForm({ ...pgProgramForm, department: e.target.value })}
                          placeholder="e.g., Department of Political Science"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Degree Types</Label>
                        <Input
                          value={pgProgramForm.degree_types}
                          onChange={(e) => setPgProgramForm({ ...pgProgramForm, degree_types: e.target.value })}
                          placeholder="e.g., M.Sc. and PhD"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Specializations (comma-separated)</Label>
                        <Textarea
                          value={pgProgramForm.specializations}
                          onChange={(e) => setPgProgramForm({ ...pgProgramForm, specializations: e.target.value })}
                          placeholder="e.g., International Relations, Conflict Studies, Counter-Terrorism"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Entry Requirements</Label>
                        <Textarea
                          value={pgProgramForm.requirements}
                          onChange={(e) => setPgProgramForm({ ...pgProgramForm, requirements: e.target.value })}
                          placeholder="Enter the entry requirements and qualifications"
                          rows={6}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={pgProgramForm.display_order}
                          onChange={(e) => setPgProgramForm({ ...pgProgramForm, display_order: parseInt(e.target.value) })}
                        />
                      </div>
                      <Button onClick={async () => {
                        const specializations = pgProgramForm.specializations
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s.length > 0);
                        
                        if (editingPgProgramId) {
                          const { error } = await supabase
                            .from("pg_programs")
                            .update({
                              department: pgProgramForm.department,
                              degree_types: pgProgramForm.degree_types,
                              specializations,
                              requirements: pgProgramForm.requirements,
                              display_order: pgProgramForm.display_order,
                            })
                            .eq("id", editingPgProgramId);
                          if (error) {
                            toast({ title: "Error", description: error.message, variant: "destructive" });
                          } else {
                            toast({ title: "Success", description: "PG program updated" });
                            queryClient.invalidateQueries({ queryKey: ["admin-pg-programs"] });
                            setEditingPgProgramId(null);
                            setPgProgramDialogOpen(false);
                          }
                        } else {
                          const { error } = await supabase
                            .from("pg_programs")
                            .insert([{
                              department: pgProgramForm.department,
                              degree_types: pgProgramForm.degree_types,
                              specializations,
                              requirements: pgProgramForm.requirements,
                              display_order: pgProgramForm.display_order,
                            }]);
                          if (error) {
                            toast({ title: "Error", description: error.message, variant: "destructive" });
                          } else {
                            toast({ title: "Success", description: "PG program added" });
                            queryClient.invalidateQueries({ queryKey: ["admin-pg-programs"] });
                            setPgProgramDialogOpen(false);
                          }
                        }
                      }}>
                        {editingPgProgramId ? "Update" : "Add"} Program
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Degree Types</TableHead>
                      <TableHead>Specializations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pgPrograms?.map((program: any) => (
                      <TableRow key={program.id}>
                        <TableCell>{program.display_order}</TableCell>
                        <TableCell className="font-medium">{program.department}</TableCell>
                        <TableCell>{program.degree_types}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {program.specializations?.slice(0, 2).map((spec: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{spec}</Badge>
                            ))}
                            {program.specializations?.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{program.specializations.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPgProgramForm({
                                  department: program.department,
                                  degree_types: program.degree_types,
                                  specializations: program.specializations?.join(', ') || '',
                                  requirements: program.requirements,
                                  display_order: program.display_order,
                                });
                                setEditingPgProgramId(program.id);
                                setPgProgramDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                const { error } = await supabase
                                  .from("pg_programs")
                                  .delete()
                                  .eq("id", program.id);
                                if (error) {
                                  toast({ title: "Error", description: error.message, variant: "destructive" });
                                } else {
                                  toast({ title: "Success", description: "PG program deleted" });
                                  queryClient.invalidateQueries({ queryKey: ["admin-pg-programs"] });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Student distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{courses?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Personnel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{personnel?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Leadership</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{leadership?.length || 0}</div>
                    </CardContent>
                  </Card>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={analyticsData?.map(d => ({ name: d.category_name, value: d.student_count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                      {analyticsData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
