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

  return (
    <div className="min-h-screen bg-gradient-subtle">
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
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="courses"><BookOpen className="mr-1 h-4 w-4" />Courses</TabsTrigger>
            <TabsTrigger value="personnel"><UserCog className="mr-1 h-4 w-4" />Personnel</TabsTrigger>
            <TabsTrigger value="leadership"><Crown className="mr-1 h-4 w-4" />Leadership</TabsTrigger>
            <TabsTrigger value="news"><Newspaper className="mr-1 h-4 w-4" />News</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="categories"><GraduationCap className="mr-1 h-4 w-4" />Categories</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="mr-1 h-4 w-4" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card><CardHeader><CardTitle>Course Management</CardTitle></CardHeader>
            <CardContent><p>Courses: {courses?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="personnel">
            <Card><CardHeader><CardTitle>Personnel Management</CardTitle></CardHeader>
            <CardContent><p>Personnel: {personnel?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="leadership">
            <Card><CardHeader><CardTitle>Leadership Management</CardTitle></CardHeader>
            <CardContent><p>Leaders: {leadership?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="news">
            <Card><CardHeader><CardTitle>News Management</CardTitle></CardHeader>
            <CardContent><p>News: {news?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="users">
            <Card><CardHeader><CardTitle>User Management</CardTitle></CardHeader>
            <CardContent><p>Users: {users?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card><CardHeader><CardTitle>Category Management</CardTitle></CardHeader>
            <CardContent><p>Categories: {categories?.length || 0}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card><CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={analyticsData?.map(d => ({ name: d.category_name, value: d.student_count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {analyticsData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
