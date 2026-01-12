import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BookOpen, Users, GraduationCap, LogOut } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

const Dashboard = () => {
  useInactivityLogout();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
  type ProfileWithCategory = ProfileRow & { student_categories?: { name: string } | null };
  const [profile, setProfile] = useState<ProfileWithCategory | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkIsAdmin = useCallback(async (userId: string) => {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileRow?.role === "admin") {
      setIsAdmin(true);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!roleData);
  }, []);

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
          checkIsAdmin(session.user.id);
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
        checkIsAdmin(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, loadProfile, checkIsAdmin]);

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

  const enrolledCourseIds = useMemo(() => {
    return (enrolledCourses || []).map((e: { course_id: string | null }) => e.course_id).filter(Boolean) as string[];
  }, [enrolledCourses]);

  const enrolledCourseIdsKey = useMemo(() => enrolledCourseIds.join(","), [enrolledCourseIds]);

  const { data: progressByCourseId } = useQuery({
    queryKey: ["quizProgress", user?.id, enrolledCourseIdsKey],
    queryFn: async () => {
      if (!user?.id) return {} as Record<string, { passed: number; total: number }>;
      if (enrolledCourseIds.length === 0) return {} as Record<string, { passed: number; total: number }>;

      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id, course_id")
        .in("course_id", enrolledCourseIds);
      if (quizzesError) throw quizzesError;

      const quizzes = (quizzesData as Array<{ id: string; course_id: string }>) || [];
      const quizIds = quizzes.map((q) => q.id);

      if (quizIds.length === 0) {
        const empty: Record<string, { passed: number; total: number }> = {};
        for (const cId of enrolledCourseIds) empty[cId] = { passed: 0, total: 0 };
        return empty;
      }

      const { data: submissionsData, error: submissionsError } = await supabase
        .from("quiz_submissions")
        .select("quiz_id, score")
        .eq("student_id", user.id)
        .in("quiz_id", quizIds);
      if (submissionsError) throw submissionsError;

      const bestScoreByQuizId = new Map<string, number>();
      for (const s of (submissionsData as Array<{ quiz_id: string; score: number | null }>) || []) {
        const prev = bestScoreByQuizId.get(s.quiz_id) ?? -1;
        const next = typeof s.score === "number" ? s.score : -1;
        if (next > prev) bestScoreByQuizId.set(s.quiz_id, next);
      }

      const passedByQuizId = new Set<string>();
      for (const [quizId, score] of bestScoreByQuizId.entries()) {
        if (score >= 70) passedByQuizId.add(quizId);
      }

      const totalByCourseId: Record<string, number> = {};
      const passedByCourseId: Record<string, number> = {};
      for (const q of quizzes) {
        totalByCourseId[q.course_id] = (totalByCourseId[q.course_id] || 0) + 1;
        if (passedByQuizId.has(q.id)) {
          passedByCourseId[q.course_id] = (passedByCourseId[q.course_id] || 0) + 1;
        }
      }

      const out: Record<string, { passed: number; total: number }> = {};
      for (const cId of enrolledCourseIds) {
        out[cId] = { passed: passedByCourseId[cId] || 0, total: totalByCourseId[cId] || 0 };
      }
      return out;
    },
    enabled: !!user?.id && enrolledCourseIds.length > 0,
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
              Role: {isAdmin ? "admin" : (profile?.role || "student")}
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
            {profile?.role === "instructor" && (
              <TabsTrigger value="manage">
                <Users className="mr-2 h-4 w-4" />
                Manage Courses
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="admin">
                <Users className="mr-2 h-4 w-4" />
                Admin
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
                          <div className="text-xs text-muted-foreground mb-4">
                            Quizzes passed:{" "}
                            {progressByCourseId?.[enrollment.course_id]?.passed ?? 0}/
                            {progressByCourseId?.[enrollment.course_id]?.total ?? 0}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate(`/course/${enrollment.courses?.id}/learn`)}
                          >
                            Continue Learning
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
                  <CardTitle>Instructor Dashboard</CardTitle>
                  <CardDescription>
                    Manage your courses, lessons, and quizzes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/instructor")}>
                    Go to Instructor Dashboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
              <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                    Manage users, content, and system settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin")}>
                    Go to Admin Dashboard
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
