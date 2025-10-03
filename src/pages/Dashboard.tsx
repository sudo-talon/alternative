import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { BookOpen, Users, GraduationCap, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          loadProfile(session.user.id);
        }, 0);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {profile?.full_name || "User"}
            </h1>
            <p className="text-muted-foreground capitalize">
              Role: {profile?.role || "student"}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              My Courses
            </TabsTrigger>
            {profile?.role === "instructor" && (
              <TabsTrigger value="manage">
                <Users className="mr-2 h-4 w-4" />
                Manage Courses
              </TabsTrigger>
            )}
            <TabsTrigger value="profile">
              <GraduationCap className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>
                  Access your enrolled courses and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No courses enrolled yet.</p>
                <Button className="mt-4" onClick={() => navigate("/courses")}>
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.role === "instructor" && (
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Your Courses</CardTitle>
                  <CardDescription>
                    Create and manage courses for your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/courses/create")}>
                    Create New Course
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span> {profile?.full_name}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {profile?.email}
                </div>
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  <span className="capitalize">{profile?.role}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
