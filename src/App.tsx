import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Departments from "./pages/Departments";
import News from "./pages/News";
import DicChronicaleOfCommand from "./pages/DicChronicaleOfCommand";
import PgProgram from "./pages/PgProgram";
import Contact from "./pages/Contact";
import EMagazine from "./pages/EMagazine";
import NotFound from "./pages/NotFound";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseEditor from "./pages/CourseEditor";
import CoursePlayer from "./pages/CoursePlayer";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

type UserRole = "student" | "instructor" | "admin";

const getUserRole = async (userId: string): Promise<UserRole> => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role === "admin") return "admin";

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleData) return "admin";
  if (profile?.role === "instructor") return "instructor";
  return "student";
};

const RequireRole = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) => {
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) {
          setRedirectTo("/auth");
          setChecking(false);
        }
        return;
      }

      const role = await getUserRole(user.id);
      if (!allowedRoles.includes(role)) {
        const fallback =
          role === "admin" ? "/admin" : role === "instructor" ? "/instructor" : "/dashboard";
        if (!cancelled) {
          setRedirectTo(fallback);
          setChecking(false);
        }
        return;
      }

      if (!cancelled) {
        setRedirectTo(null);
        setChecking(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <RequireRole allowedRoles={["student"]}>
                  <Dashboard />
                </RequireRole>
              }
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route
              path="/admin"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/news" element={<News />} />
            <Route path="/chronicle-of-command" element={<DicChronicaleOfCommand />} />
            <Route path="/pg-program" element={<PgProgram />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/e-magazine" element={<EMagazine />} />
            <Route
              path="/instructor"
              element={
                <RequireRole allowedRoles={["instructor", "admin"]}>
                  <InstructorDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/instructor/course/:courseId"
              element={
                <RequireRole allowedRoles={["instructor", "admin"]}>
                  <CourseEditor />
                </RequireRole>
              }
            />
            <Route
              path="/course/:courseId/learn"
              element={
                <RequireRole allowedRoles={["student", "instructor", "admin"]}>
                  <CoursePlayer />
                </RequireRole>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
