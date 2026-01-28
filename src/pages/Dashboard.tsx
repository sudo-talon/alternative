import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient as supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BookOpen, Users, GraduationCap, LogOut, Lock, Check, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

const Dashboard = () => {
  useInactivityLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
  type ProfileWithCategory = ProfileRow & { student_categories?: { name: string } | null };
  const [profile, setProfile] = useState<ProfileWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_categories(name)")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as ProfileWithCategory);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const u = userData?.user;
      const email = u?.email || "";
      const fullNameMeta = u?.user_metadata?.full_name as string | undefined;
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
      if (created) setProfile(created as ProfileWithCategory);
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
    }
  }, []);

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
  }, [navigate, loadProfile]);

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

  // Fetch pending enrollments for instructor's courses
  const { data: pendingEnrollments } = useQuery<any>({
    queryKey: ["instructor-pending-enrollments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user.id);
      
      if (!courses?.length) return [];
      
      const courseIds = courses.map(c => c.id);
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses(title),
          profiles:student_id(full_name, email)
        `)
        .in("course_id", courseIds)
        .eq("is_approved", false)
        .eq("status", "pending") as any;
      
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === "instructor",
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("enrollments")
        .update({
          is_approved: approved,
          status: approved ? "approved" : "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enrollment status updated");
      queryClient.invalidateQueries({ queryKey: ["instructor-pending-enrollments"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/ABORTED/i.test(msg)) {
        toast.error("Sign out failed");
      }
    } finally {
      navigate("/");
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
          <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto min-h-[44px]">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              My Courses
            </TabsTrigger>
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
                    {enrolledCourses.map((enrollment) => (
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

          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold text-muted-foreground">Name</span>
                      <span>{profile?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold text-muted-foreground">Email</span>
                      <span>{profile?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-semibold text-muted-foreground">Role</span>
                      <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
                    </div>
                    {profile?.student_categories && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-semibold text-muted-foreground">Category</span>
                        <Badge variant="outline">{profile.student_categories.name}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Password</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change your password to keep your account secure
                    </p>
                    <ChangePasswordDialog />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
