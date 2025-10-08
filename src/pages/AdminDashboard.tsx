import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");

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
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage news and content</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create News Article
              </CardTitle>
              <CardDescription>Add breaking news to the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <Input
                    placeholder="News title"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="News content"
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createNewsMutation.isPending}>
                  {createNewsMutation.isPending ? "Creating..." : "Create News"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-elevated">
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
                    <div key={item.id} className="p-3 border rounded-lg flex justify-between items-start gap-3">
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
      </div>
    </div>
  );
};

export default AdminDashboard;
