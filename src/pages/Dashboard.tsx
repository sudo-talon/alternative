import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { BookOpen, Users, GraduationCap, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const Dashboard = () => {
  useInactivityLogout();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .select("*, student_categories(name)")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const u = userData?.user;
      const email = u?.email || "";
      const fullNameMeta = (u as any)?.user_metadata?.full_name;
      const full_name = fullNameMeta || email.split("@")[0] || "User";
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: userId, email, full_name, role: "student" }]);
      if (insertError) throw insertError;

      const { data: created } = await supabase
        .from("profiles")
        .select("*, student_categories(name)")
        .eq("id", userId)
        .maybeSingle();
      if (created) setProfile(created);
    } catch (error: any) {
      console.error("Error loading profile:", error);
    }
  };

  // Fetch enrolled courses with instructor info
  const { data: enrolledCourses } = useQuery({
    queryKey: ["enrolledCourses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses(
            *,
            profiles:instructor_id(full_name, email)
          )
        `)
        .eq("student_id", user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

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
            {profile?.student_categories && (
              <Badge variant="outline" className="mt-2">
                {profile.student_categories.name}
              </Badge>
            )}
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
                {enrolledCourses && enrolledCourses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((enrollment: any) => (
                      <Card key={enrollment.id} className="hover-scale">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {enrollment.courses?.title}
                          </CardTitle>
                          <CardDescription>
                            Instructor: {enrollment.courses?.profiles?.full_name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {enrollment.courses?.description}
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/course/${enrollment.courses?.title}`)}
                          >
                            View Course
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground">No courses enrolled yet.</p>
                    <Button className="mt-4" onClick={() => navigate("/courses")}>
                      Browse Available Courses
                    </Button>
                  </>
                )}
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
                {profile?.student_categories && (
                  <div>
                    <span className="font-semibold">Category:</span>{" "}
                    {profile.student_categories.name}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;