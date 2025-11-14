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
import { Newspaper, Trash2, Plus, Users, GraduationCap, Edit, BarChart3, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserCategory, setSelectedUserCategory] = useState("");

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

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_categories(name), user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch news
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

  // Fetch student categories
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

  // Fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data: categoryAnalytics, error: catError } = await supabase
        .from("category_analytics")
        .select("*");
      
      if (catError) throw catError;
      return categoryAnalytics;
    },
    enabled: isAdmin,
  });

  // Create news mutation
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

  // Delete news mutation
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

  // Create category mutation
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

  // Delete category mutation
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

  // Update user role mutation
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

  // Update user category mutation
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and analytics</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Shield className="mr-2 h-5 w-5" />
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="categories">
              <GraduationCap className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users, their roles, and categories</CardDescription>
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
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.student_categories?.name || 'None'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit Role
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update User Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {user.full_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>Select Role</Label>
                                    <Select
                                      value={selectedRole}
                                      onValueChange={setSelectedRole}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      if (selectedRole) {
                                        updateUserRoleMutation.mutate({
                                          userId: user.id,
                                          role: selectedRole,
                                        });
                                      }
                                    }}
                                    disabled={!selectedRole}
                                  >
                                    Update Role
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  <GraduationCap className="h-4 w-4 mr-1" />
                                  Set Category
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Student Category</DialogTitle>
                                  <DialogDescription>
                                    Assign a category to {user.full_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>Select Category</Label>
                                    <Select
                                      value={selectedUserCategory}
                                      onValueChange={setSelectedUserCategory}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {categories?.map((cat) => (
                                          <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      updateUserCategoryMutation.mutate({
                                        userId: user.id,
                                        categoryId: selectedUserCategory === 'none' ? null : selectedUserCategory,
                                      });
                                    }}
                                  >
                                    Update Category
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management */}
          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create News Article</CardTitle>
                <CardDescription>Add a new news article or announcement</CardDescription>
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
                  rows={6}
                />
                <Button onClick={() => createNewsMutation.mutate()} disabled={!newsTitle || !newsContent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create News
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Published News</CardTitle>
                <CardDescription>Manage existing news articles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{new Date(item.published_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
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
          </TabsContent>

          {/* Categories Management */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Student Category</CardTitle>
                <CardDescription>Add a new student category for grouping users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Textarea
                  placeholder="Category Description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                />
                <Button onClick={() => createCategoryMutation.mutate()} disabled={!newCategoryName}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Categories</CardTitle>
                <CardDescription>Manage existing categories</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
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
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Analytics</CardTitle>
                <CardDescription>Student distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && analyticsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category_name, student_count }) => `${category_name}: ${student_count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="student_count"
                      >
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No analytics data available</p>
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
