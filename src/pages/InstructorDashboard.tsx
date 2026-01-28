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
import { BookOpen, Users, GraduationCap, LogOut, Check, X, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const InstructorDashboard = () => {
  useInactivityLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        if (data.role !== "instructor" && data.role !== "admin") {
           // Redirect non-instructors back to normal dashboard
           navigate("/dashboard");
        }
        return;
      }
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
    }
  }, [navigate]);

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
        .eq("is_approved", false) as any;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && (profile?.role === "instructor" || profile?.role === "admin"),
  });

  // Fetch instructor's courses
  const { data: myCourses } = useQuery({
    queryKey: ["instructor-courses", user?.id],
    queryFn: async () => {
        if (!user?.id) return [];
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("instructor_id", user.id);
        if (error) throw error;
        return data;
    },
    enabled: !!user?.id && (profile?.role === "instructor" || profile?.role === "admin"),
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("enrollments")
        .update({
          is_approved: approved,
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
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your courses and student enrollments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto min-h-[44px]">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Student View
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto min-h-[44px]">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="approvals">
              <Users className="mr-2 h-4 w-4" />
              Pending Approvals
              {pendingEnrollments?.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {pendingEnrollments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="mr-2 h-4 w-4" />
              My Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Enrollments</CardTitle>
                <CardDescription>
                  Approve or reject student enrollment requests for your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingEnrollments && pendingEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingEnrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                        <div>
                          <p className="font-medium text-lg">{enrollment.profiles?.full_name || "Unknown Student"}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.profiles?.email}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                Course: {enrollment.courses?.title}
                             </Badge>
                             <span className="text-xs text-muted-foreground">
                                Requested: {new Date(enrollment.created_at).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                            onClick={() => updateEnrollmentMutation.mutate({ id: enrollment.id, approved: true })}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 min-w-[100px]"
                            onClick={() => updateEnrollmentMutation.mutate({ id: enrollment.id, approved: false })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No pending enrollments to review.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>
                  Courses you are teaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                    <Button onClick={() => navigate("/courses/create")}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Create New Course
                    </Button>
                </div>
                {myCourses && myCourses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myCourses.map((course: any) => (
                      <Card key={course.id} className="hover-scale transition-all">
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {course.category || "Uncategorized"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                            {course.description}
                          </p>
                          <div className="flex justify-between items-center">
                              <Badge variant={course.is_published ? "default" : "secondary"}>
                                  {course.is_published ? "Published" : "Draft"}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/course/${course.title}`)}
                              >
                                View
                              </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>You haven't created any courses yet.</p>
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

export default InstructorDashboard;
