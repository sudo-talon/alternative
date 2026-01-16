import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Newspaper, Trash2, Plus, Users, GraduationCap, Edit, BarChart3, Shield, BookOpen, UserCog, Crown, FileText, Database as DatabaseIcon, Image as ImageIcon, Video } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MagazineUploadDialog } from "@/components/MagazineUploadDialog";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";

const COLORS = ['hsl(85, 25%, 35%)', 'hsl(85, 25%, 45%)', 'hsl(85, 25%, 55%)', 'hsl(85, 25%, 65%)'];

const categoryClasses = (name?: string) => {
  const n = String(name || "").toLowerCase();
  if (/military/.test(n)) return "bg-green-600 text-white";
  if (/civilian/.test(n)) return "bg-blue-600 text-white";
  if (/post|graduate|pg/.test(n)) return "bg-purple-600 text-white";
  if (/diploma|certificate|short/.test(n)) return "bg-amber-500 text-black";
  return "bg-slate-600 text-white";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // News state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsFeaturedImage, setNewsFeaturedImage] = useState("");
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  
  // Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  
  // User management state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserCategory, setSelectedUserCategory] = useState("");
  const [videoForm, setVideoForm] = useState({ title: "", url: "" });
  const [pictureForm, setPictureForm] = useState({ title: "", image_url: "" });
  type GalleryVideo = { id: string; title: string; url: string };
  type GalleryPicture = { id: string; title: string; image_url: string };
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>(() => {
    try { return JSON.parse(localStorage.getItem("dic_gallery_videos") || "[]"); } catch { return []; }
  });
  const [galleryPictures, setGalleryPictures] = useState<GalleryPicture[]>(() => {
    try { return JSON.parse(localStorage.getItem("dic_gallery_pictures") || "[]"); } catch { return []; }
  });
  const persistVideos = (list: GalleryVideo[]) => {
    setGalleryVideos(list);
    localStorage.setItem("dic_gallery_videos", JSON.stringify(list));
  };
  const persistPictures = (list: GalleryPicture[]) => {
    setGalleryPictures(list);
    localStorage.setItem("dic_gallery_pictures", JSON.stringify(list));
  };
  const addVideo = () => {
    const v: GalleryVideo = { id: crypto.randomUUID(), title: videoForm.title || "Untitled", url: videoForm.url };
    const list = [v, ...galleryVideos];
    persistVideos(list);
    setVideoForm({ title: "", url: "" });
    toast({ title: "Saved", description: "Video added to gallery" });
  };
  const deleteVideo = (id: string) => {
    const list = galleryVideos.filter(v => v.id !== id);
    persistVideos(list);
  };
  const addPicture = () => {
    const p: GalleryPicture = { id: crypto.randomUUID(), title: pictureForm.title || "Untitled", image_url: pictureForm.image_url };
    const list = [p, ...galleryPictures];
    persistPictures(list);
    setPictureForm({ title: "", image_url: "" });
    toast({ title: "Saved", description: "Picture added to gallery" });
  };
  const deletePicture = (id: string) => {
    const list = galleryPictures.filter(p => p.id !== id);
    persistPictures(list);
  };
  

  // Personnel state
  const [personnelForm, setPersonnelForm] = useState({
    full_name: "", email: "", phone: "", category: "civilian", position: "", department: "", rank: "", bio: "", photo_url: ""
  });
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);
  const [personnelPhotoFile, setPersonnelPhotoFile] = useState<File | null>(null);
  const [personnelPhotoPreview, setPersonnelPhotoPreview] = useState<string | null>(null);
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);

  // Leadership state
  const [leadershipForm, setLeadershipForm] = useState({
    full_name: "", position: "", rank: "", bio: "", photo_url: "", display_order: 0
  });
  const [editingLeadershipId, setEditingLeadershipId] = useState<string | null>(null);
  const [leadershipPhotoFile, setLeadershipPhotoFile] = useState<File | null>(null);
  const [leadershipPhotoPreview, setLeadershipPhotoPreview] = useState<string | null>(null);
  const [leadershipDialogOpen, setLeadershipDialogOpen] = useState(false);

  // PG Programs state
  const [pgProgramForm, setPgProgramForm] = useState({
    department: "", degree_types: "", specializations: "", requirements: "", display_order: 0
  });
  const [editingPgProgramId, setEditingPgProgramId] = useState<string | null>(null);
  const [pgProgramDialogOpen, setPgProgramDialogOpen] = useState(false);

  type MagazineRow = Database["public"]["Tables"]["magazines"]["Row"];
  const [magazineDialogOpen, setMagazineDialogOpen] = useState(false);
  const [magazineUploadOpen, setMagazineUploadOpen] = useState(false);
  const [editingMagazine, setEditingMagazine] = useState<MagazineRow | null>(null);
  const [magazineForm, setMagazineForm] = useState({
    title: "",
    issue: "",
    description: "",
    published_at: "",
  });

  const uploadAvatarImage = async (file: File, folder: "personnel" | "leadership") => {
    const timestamp = Date.now();
    const path = `avatars/${folder}/${timestamp}-${file.name}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    return publicUrl;
  };

  const handlePersonnelPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPersonnelPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPersonnelPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLeadershipPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeadershipPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLeadershipPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Courses state
  const [courseForm, setCourseForm] = useState({
    title: "", description: "", full_description: "", category: "Generic Courses"
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  type PersonnelRow = Database["public"]["Tables"]["personnel"]["Row"];
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const [documentsOwner, setDocumentsOwner] = useState<PersonnelRow | null>(null);
  const [documentsList, setDocumentsList] = useState<Array<{ name: string }>>([]);
  const [docVolumeByDept, setDocVolumeByDept] = useState<Array<{ department: string; count: number }>>([]);
  const [populatingAll, setPopulatingAll] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState<string>(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? "magazines");
  const mapStorageError = (msg: string) => (/bucket\s*not\s*found/i.test(msg) ? `Storage bucket '${bucketName}' not found. Create it in Supabase Storage or set VITE_SUPABASE_STORAGE_BUCKET.` : msg);

  useEffect(() => {
    const detectBucket = async () => {
      const candidates = [bucketName, "magazines", "public", "documents", "files", "uploads", "avatars"];
      for (const name of candidates) {
        try {
          const { error } = await supabase.storage.from(name).list("", { limit: 1 });
          if (!error) { setBucketName(name); return; }
        } catch (_) { void 0; }
      }
    };
    detectBucket();
  }, [bucketName]);

  const courseCategories = [
    "Generic Courses",
    "Specialized Courses", 
    "Language Courses",
    "Strategic Courses"
  ];

  const predefinedCourses = [
    // Generic Courses
    { title: "Basic Intelligence Officers' Course", description: "Foundation training for intelligence officers", category: "Generic Courses" },
    { title: "Defence Intelligence Officers' Course", description: "Comprehensive defence intelligence training", category: "Generic Courses" },
    { title: "Advanced Defence Intelligence Officers' Course", description: "Advanced training for senior officers", category: "Generic Courses" },
    { title: "Junior Defence Intelligence Basic Course", description: "Entry-level training for junior personnel", category: "Generic Courses" },
    { title: "Junior Defence Intelligence Intermediate Course", description: "Intermediate skills development", category: "Generic Courses" },
    { title: "Junior Defence Intelligence Advanced Course", description: "Advanced training for junior officers", category: "Generic Courses" },
    // Specialized Courses
    { title: "Psychological Operations Course", description: "Strategic psychological operations training", category: "Specialized Courses" },
    { title: "Intelligence Analysis Officers' Course", description: "Advanced intelligence analysis techniques", category: "Specialized Courses" },
    { title: "Security Investigation and Interrogation Course", description: "Professional interrogation methods", category: "Specialized Courses" },
    { title: "Document Security Course", description: "Document classification and protection", category: "Specialized Courses" },
    { title: "Joint Military Attache / Advisers Course", description: "Diplomatic and advisory training", category: "Specialized Courses" },
    { title: "Special Intelligence and Security Course", description: "Specialized intelligence operations", category: "Specialized Courses" },
    // Language Courses
    { title: "Basic French Course", description: "Foundation French language training", category: "Language Courses" },
    { title: "Intermediate French Language Course", description: "Intermediate French proficiency", category: "Language Courses" },
    { title: "Basic German Language Course", description: "Foundation German language training", category: "Language Courses" },
    // Strategic Courses
    { title: "The National Security Training Seminar", description: "National security strategy and policy", category: "Strategic Courses" },
    { title: "Intelligence Analysis Course", description: "Strategic intelligence assessment", category: "Strategic Courses" },
    { title: "Peace and Conflict Studies", description: "Peace operations and conflict resolution", category: "Strategic Courses" },
    { title: "Strategic Security Course", description: "Strategic security planning and management", category: "Strategic Courses" },
  ];

  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdminByProfile = profile?.role === "admin";
      let hasAdminRole = false;
      if (!isAdminByProfile) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        hasAdminRole = !!rolesData;
      }

      if (!isAdminByProfile && !hasAdminRole) {
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
  }, [navigate, toast]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Queries and mutations
  const createNewsMutation = useMutation({
    mutationFn: async () => {
      const payloadWithImage: { title: string; content: string; featured_image_url?: string | null } = {
        title: newsTitle,
        content: newsContent,
      };
      if (newsFeaturedImage) payloadWithImage.featured_image_url = newsFeaturedImage;
      if (editingNewsId) {
        try {
          const { error } = await supabase
            .from("news")
            .update(payloadWithImage)
            .eq("id", editingNewsId);
          if (error) throw error;
        } catch {
          const { error } = await supabase
            .from("news")
            .update({ title: newsTitle, content: newsContent })
            .eq("id", editingNewsId);
          if (error) throw error;
        }
      } else {
        try {
          const { error } = await supabase
            .from("news")
            .insert([payloadWithImage]);
          if (error) throw error;
        } catch {
          const { error } = await supabase
            .from("news")
            .insert([{ title: newsTitle, content: newsContent }]);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      setNewsTitle("");
      setNewsContent("");
      setEditingNewsId(null);
      setNewsFeaturedImage("");
      setNewsDialogOpen(false);
      toast({ title: "Success", description: editingNewsId ? "News updated successfully" : "News created successfully" });
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
      if (editingCategoryId) {
        const { error } = await supabase
          .from("student_categories")
          .update({ name: newCategoryName, description: newCategoryDescription })
          .eq("id", editingCategoryId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("student_categories")
          .insert([{ name: newCategoryName, description: newCategoryDescription }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-categories"] });
      setNewCategoryName("");
      setNewCategoryDescription("");
      setEditingCategoryId(null);
      setCategoryDialogOpen(false);
      toast({ title: "Success", description: editingCategoryId ? "Category updated successfully" : "Category created successfully" });
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

  const refreshDocumentsList = async (ownerId?: string) => {
    try {
      const id = ownerId || documentsOwner?.id;
      if (!id) return;
      const folder = `personnel/${id}`;
      const { data, error } = await supabase.storage.from(bucketName).list(folder, { limit: 100 });
      if (error) throw error;
      setDocumentsList(((data || []) as unknown as Array<{ name: string }>).map((d) => ({ name: d.name })));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: mapStorageError(message), variant: "destructive" });
    }
  };

  const handleDocumentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (!documentsOwner?.id || files.length === 0) return;
      const folder = `personnel/${documentsOwner.id}`;
      for (const file of files) {
        const path = `${folder}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from(bucketName).upload(path, file, { upsert: false });
        if (error) throw error;
      }
      await refreshDocumentsList(documentsOwner.id);
      toast({ title: "Success", description: "Documents uploaded" });
      e.currentTarget.value = "";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: mapStorageError(message), variant: "destructive" });
    }
  };

  const previewDocument = async (ownerId?: string, name?: string) => {
    try {
      const id = ownerId || documentsOwner?.id;
      if (!id || !name) return;
      const path = `personnel/${id}/${name}`;
      const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(path, 60);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: mapStorageError(message), variant: "destructive" });
    }
  };

  const deleteDocument = async (ownerId?: string, name?: string) => {
    try {
      const id = ownerId || documentsOwner?.id;
      if (!id || !name) return;
      const path = `personnel/${id}/${name}`;
      const { error } = await supabase.storage.from(bucketName).remove([path]);
      if (error) throw error;
      await refreshDocumentsList(id);
      toast({ title: "Success", description: "Document deleted" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: mapStorageError(message), variant: "destructive" });
    }
  };

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "student" | "instructor" | "admin" }) => {
      // First delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Then insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error) => {
      const message = (error as unknown) instanceof Error ? (error as Error).message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
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
      const message = (error as unknown) instanceof Error ? (error as Error).message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
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
  

  type NewsItem = {
    id: string;
    title: string;
    content: string;
    published_at: string;
    created_at: string;
    featured_image_url?: string | null;
  };

  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as NewsItem[];
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

  const { data: enrollments } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const monthKey = (d: string) => {
    const dt = new Date(d);
    const m = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    return m;
  };

  const last12 = (() => {
    const now = new Date();
    const out: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
    }
    return out;
  })();

  const enrollmentTrend = last12.map(m => ({
    month: m,
    count: (enrollments || []).filter((e) => monthKey(String(e.enrolled_at)) === m).length,
  }));

  type EnrollmentLike = { completed_at?: string | null; status?: string | null; enrolled_at: string } & Record<string, unknown>;
  const completionRateTrend = last12.map(m => {
    const enrollList = ((enrollments || []) as unknown as EnrollmentLike[]);
    const monthEnrolls = enrollList.filter((e) => monthKey(String(e.enrolled_at)) === m);
    const completed = monthEnrolls.filter((e) => !!e.completed_at || (e.status && String(e.status).toLowerCase() === "completed"));
    const rate = monthEnrolls.length ? Math.round((completed.length / monthEnrolls.length) * 100) : 0;
    return { month: m, rate };
  });

  useEffect(() => {
    const computeDocVolume = async () => {
      try {
        if (!isAdmin || !personnel || personnel.length === 0) return;
        const counts = new Map<string, number>();
        for (const p of (personnel || [])) {
          const dept = p.department || "Unknown";
          const folder = `personnel/${p.id}`;
          const { data, error } = await supabase.storage.from(bucketName).list(folder, { limit: 100 });
          if (error) continue;
          counts.set(dept, (counts.get(dept) || 0) + (data?.length || 0));
        }
        setDocVolumeByDept(Array.from(counts.entries()).map(([department, count]) => ({ department, count })));
      } catch (e) {
        // silent fail for analytics
      }
    };
    computeDocVolume();
  }, [isAdmin, personnel, bucketName]);

  const personnelCategoryCounts = (() => {
    const civ = (personnel || []).filter((p) => (p.category || "").toLowerCase() === "civilian").length;
    const mil = (personnel || []).filter((p) => (p.category || "").toLowerCase() === "military").length;
    return [
      { name: "Civilian", value: civ },
      { name: "Military", value: mil },
    ];
  })();

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

  const { data: magazines } = useQuery<MagazineRow[]>({
    queryKey: ["admin-magazines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("magazines")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as MagazineRow[];
    },
    enabled: isAdmin,
  });

  const createCourseMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      if (editingCourseId) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: courseForm.title,
            description: courseForm.description,
            full_description: courseForm.full_description,
            category: courseForm.category
          })
          .eq("id", editingCourseId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([{
            title: courseForm.title,
            description: courseForm.description,
            full_description: courseForm.full_description,
            category: courseForm.category,
            instructor_id: user.id
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setCourseForm({ title: "", description: "", full_description: "", category: "Generic Courses" });
      setEditingCourseId(null);
      setCourseDialogOpen(false);
      toast({ title: "Success", description: editingCourseId ? "Course updated successfully" : "Course created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
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
      let photoUrl = personnelForm.photo_url || null;
      if (personnelPhotoFile) {
        photoUrl = await uploadAvatarImage(personnelPhotoFile, "personnel");
      }
      const payload = { ...personnelForm, photo_url: photoUrl };
      if (editingPersonnelId) {
        const { error } = await supabase
          .from("personnel")
          .update(payload)
          .eq("id", editingPersonnelId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("personnel").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personnel"] });
      setPersonnelForm({ full_name: "", email: "", phone: "", category: "civilian", position: "", department: "", rank: "", bio: "", photo_url: "" });
      setPersonnelPhotoFile(null);
      setPersonnelPhotoPreview(null);
      setEditingPersonnelId(null);
      setPersonnelDialogOpen(false);
      toast({ title: "Success", description: editingPersonnelId ? "Personnel updated" : "Personnel created" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to save personnel";
      toast({ title: "Error", description: message, variant: "destructive" });
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
      let photoUrl = leadershipForm.photo_url || null;
      if (leadershipPhotoFile) {
        photoUrl = await uploadAvatarImage(leadershipPhotoFile, "leadership");
      }
      const payload = { ...leadershipForm, photo_url: photoUrl };
      if (editingLeadershipId) {
        const { error } = await supabase
          .from("leadership")
          .update(payload)
          .eq("id", editingLeadershipId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("leadership").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
      setLeadershipForm({ full_name: "", position: "", rank: "", bio: "", photo_url: "", display_order: 0 });
      setLeadershipPhotoFile(null);
      setLeadershipPhotoPreview(null);
      setEditingLeadershipId(null);
      setLeadershipDialogOpen(false);
      toast({ title: "Success", description: editingLeadershipId ? "Leadership updated" : "Leadership created" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to save leadership";
      toast({ title: "Error", description: message, variant: "destructive" });
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

  const updateLeadershipStatusMutation = useMutation({
    mutationFn: async ({ id, is_active, position }: { id: string; is_active: boolean; position: string }) => {
      const { error } = await supabase
        .from("leadership")
        .update({ is_active, position })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
      toast({ title: "Success", description: "Leadership status updated" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const updateMagazineMutation = useMutation({
    mutationFn: async () => {
      if (!editingMagazine) return;
      const { error } = await supabase
        .from("magazines")
        .update({
          title: magazineForm.title,
          issue: magazineForm.issue || null,
          description: magazineForm.description || null,
          published_at: magazineForm.published_at || editingMagazine.published_at,
        })
        .eq("id", editingMagazine.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-magazines"] });
      setEditingMagazine(null);
      setMagazineDialogOpen(false);
      setMagazineForm({ title: "", issue: "", description: "", published_at: "" });
      toast({ title: "Success", description: "Magazine updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMagazineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("magazines").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-magazines"] });
      toast({ title: "Success", description: "Magazine deleted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto">
            <TabsTrigger value="courses" className="h-full whitespace-normal min-h-[44px]"><BookOpen className="mr-1 h-4 w-4" />Courses</TabsTrigger>
            <TabsTrigger value="personnel" className="h-full whitespace-normal min-h-[44px]"><UserCog className="mr-1 h-4 w-4" />Personnel</TabsTrigger>
            <TabsTrigger value="leadership" className="h-full whitespace-normal min-h-[44px]"><Crown className="mr-1 h-4 w-4" />Leadership</TabsTrigger>
            <TabsTrigger value="pgprograms" className="h-full whitespace-normal min-h-[44px]"><GraduationCap className="mr-1 h-4 w-4" />PG Programs</TabsTrigger>
            <TabsTrigger value="news" className="h-full whitespace-normal min-h-[44px]"><Newspaper className="mr-1 h-4 w-4" />News</TabsTrigger>
            <TabsTrigger value="magazines" className="h-full whitespace-normal min-h-[44px]"><FileText className="mr-1 h-4 w-4" />Magazines</TabsTrigger>
            <TabsTrigger value="users" className="h-full whitespace-normal min-h-[44px]"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="categories" className="h-full whitespace-normal min-h-[44px]"><Shield className="mr-1 h-4 w-4" />Categories</TabsTrigger>
            <TabsTrigger value="analytics" className="h-full whitespace-normal min-h-[44px]"><BarChart3 className="mr-1 h-4 w-4" />Analytics</TabsTrigger>
            <TabsTrigger value="documents" className="h-full whitespace-normal min-h-[44px]"><FileText className="mr-1 h-4 w-4" />Documents</TabsTrigger>
            <TabsTrigger value="about-management" className="h-full whitespace-normal min-h-[44px]"><Crown className="mr-1 h-4 w-4" />About Management</TabsTrigger>
            <TabsTrigger value="gallery" className="h-full whitespace-normal min-h-[44px]"><ImageIcon className="mr-1 h-4 w-4" />Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Create and manage all courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => {
                    setCourseForm({ title: "", description: "", full_description: "", category: "Generic Courses" });
                    setEditingCourseId(null);
                    setCourseDialogOpen(true);
                  }}>
                    <Plus className="mr-2 h-4 w-4" />Add Course
                  </Button>
                  <Select onValueChange={(value) => {
                    const preset = predefinedCourses.find(c => c.title === value);
                    if (preset) {
                      setCourseForm({ ...courseForm, title: preset.title, description: preset.description, category: preset.category });
                      setEditingCourseId(null);
                      setCourseDialogOpen(true);
                    }
                  }}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Quick add from predefined courses" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseCategories.map(cat => (
                        <div key={cat}>
                          <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">{cat}</div>
                          {predefinedCourses.filter(c => c.category === cat).map(course => (
                            <SelectItem key={course.title} value={course.title}>{course.title}</SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingCourseId ? "Edit" : "Add New"} Course</DialogTitle>
                      <DialogDescription>Enter course details below</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="c_title">Course Title</Label>
                        <Input id="c_title" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="c_category">Category</Label>
                        <Select value={courseForm.category} onValueChange={(value) => setCourseForm({...courseForm, category: value})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {courseCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="c_description">Short Description</Label>
                        <Textarea id="c_description" value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} rows={2} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="c_full_description">Full Description</Label>
                        <Textarea id="c_full_description" value={courseForm.full_description} onChange={(e) => setCourseForm({...courseForm, full_description: e.target.value})} rows={5} />
                      </div>
                      <Button onClick={() => createCourseMutation.mutate()} disabled={!courseForm.title}>
                        {editingCourseId ? "Update" : "Create"} Course
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="overflow-x-auto">
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
                    {courses?.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.profiles?.full_name}</TableCell>
                        <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                        <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setCourseForm({
                                title: course.title,
                                description: course.description || "",
                                full_description: course.full_description || "",
                                category: course.category || "Generic Courses"
                              });
                              setEditingCourseId(course.id);
                              setCourseDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteCourseMutation.mutate(course.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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
                <Button onClick={() => {
                  setPersonnelForm({ full_name: "", email: "", phone: "", category: "civilian", position: "", department: "", rank: "", bio: "", photo_url: "" });
                  setEditingPersonnelId(null);
                  setPersonnelPhotoFile(null);
                  setPersonnelPhotoPreview(null);
                  setPersonnelDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />Add Personnel
                </Button>

                <Dialog open={personnelDialogOpen} onOpenChange={setPersonnelDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPersonnelId ? "Edit" : "Add New"} Personnel</DialogTitle>
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
                        <Label>Photo (optional)</Label>
                        <div className="flex items-start gap-4">
                          <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {personnelPhotoFile ? personnelPhotoFile.name : "Click to upload photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePersonnelPhotoChange}
                              className="hidden"
                            />
                          </label>
                          {(personnelPhotoPreview || personnelForm.photo_url) && (
                            <img
                              src={personnelPhotoPreview || personnelForm.photo_url || ""}
                              alt="Photo preview"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>
                      <Button onClick={() => createPersonnelMutation.mutate()}>{editingPersonnelId ? "Update" : "Create"} Personnel</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="overflow-x-auto">
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
                    {personnel?.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.full_name}</TableCell>
                        <TableCell><Badge className={categoryClasses(person.category)}>{person.category}</Badge></TableCell>
                        <TableCell>{person.position}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setPersonnelForm(person);
                              setEditingPersonnelId(person.id);
                              setPersonnelPhotoFile(null);
                              setPersonnelPhotoPreview(person.photo_url || null);
                              setPersonnelDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deletePersonnelMutation.mutate(person.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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
                <Button onClick={() => {
                  setLeadershipForm({ full_name: "", position: "", rank: "", bio: "", photo_url: "", display_order: 0 });
                  setEditingLeadershipId(null);
                  setLeadershipPhotoFile(null);
                  setLeadershipPhotoPreview(null);
                  setLeadershipDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />Add Leader
                </Button>

                <Dialog open={leadershipDialogOpen} onOpenChange={setLeadershipDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingLeadershipId ? "Edit" : "Add New"} Leader</DialogTitle>
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
                        <Label>Photo (optional)</Label>
                        <div className="flex items-start gap-4">
                          <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {leadershipPhotoFile ? leadershipPhotoFile.name : "Click to upload photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLeadershipPhotoChange}
                              className="hidden"
                            />
                          </label>
                          {(leadershipPhotoPreview || leadershipForm.photo_url) && (
                            <img
                              src={leadershipPhotoPreview || leadershipForm.photo_url || ""}
                              alt="Photo preview"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="l_order">Display Order</Label>
                        <Input
                          id="l_order"
                          type="number"
                          value={leadershipForm.display_order}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setLeadershipForm({
                              ...leadershipForm,
                              display_order: Number.isNaN(value) ? 0 : value,
                            });
                          }}
                        />
                      </div>
                      <Button onClick={() => createLeadershipMutation.mutate()}>{editingLeadershipId ? "Update" : "Create"} Leader</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {leadership?.map((leader) => (
                        <TableRow key={leader.id}>
                          <TableCell>{leader.display_order}</TableCell>
                          <TableCell className="font-medium">{leader.full_name}</TableCell>
                          <TableCell>
                            <Select
                            value={leader.position || ""}
                            onValueChange={(value) =>
                              updateLeadershipStatusMutation.mutate({ id: leader.id, is_active: !!leader.is_active, position: value })
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Commandant DIC">Commandant DIC</SelectItem>
                              <SelectItem value="Former Commandant DIC">Former Commandant DIC</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{leader.rank}</TableCell>
                        <TableCell>
                          <Switch
                            checked={!!leader.is_active}
                            onCheckedChange={(value) =>
                              updateLeadershipStatusMutation.mutate({
                                id: leader.id,
                                is_active: !!value,
                                position: value ? "Commandant DIC" : "Former Commandant DIC",
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setLeadershipForm(leader);
                              setEditingLeadershipId(leader.id);
                              setLeadershipPhotoFile(null);
                              setLeadershipPhotoPreview(leader.photo_url || null);
                              setLeadershipDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteLeadershipMutation.mutate(leader.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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
                <Button onClick={() => {
                  setNewsTitle("");
                  setNewsContent("");
                  setNewsFeaturedImage("");
                  setEditingNewsId(null);
                  setNewsDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />Create News
                </Button>

                <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingNewsId ? "Edit" : "Create"} News</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="news_title">Title</Label>
                        <Input id="news_title" placeholder="News title" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="news_content">Content</Label>
                        <Textarea id="news_content" placeholder="News content" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={4} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="news_image">Featured Image URL</Label>
                        <Input id="news_image" placeholder="https://..." value={newsFeaturedImage} onChange={(e) => setNewsFeaturedImage(e.target.value)} />
                      </div>
                      <Button onClick={() => createNewsMutation.mutate()} disabled={!newsTitle || !newsContent}>
                        {editingNewsId ? "Update" : "Create"} News
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="overflow-x-auto">
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
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setNewsTitle(item.title);
                              setNewsContent(item.content);
                              setNewsFeaturedImage(item.featured_image_url || "");
                              setEditingNewsId(item.id);
                              setNewsDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteNewsMutation.mutate(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="magazines">
            <Card>
              <CardHeader>
                <CardTitle>Magazine Management</CardTitle>
                <CardDescription>Upload and manage digital magazines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setMagazineUploadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />Add Magazine
                  </Button>
                </div>

                <MagazineUploadDialog
                  isOpen={magazineUploadOpen}
                  onClose={() => setMagazineUploadOpen(false)}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["admin-magazines"] });
                    setMagazineUploadOpen(false);
                    toast({ title: "Success", description: "Magazine uploaded" });
                  }}
                />

                <Dialog
                  open={magazineDialogOpen}
                  onOpenChange={(open) => {
                    setMagazineDialogOpen(open);
                    if (!open) {
                      setEditingMagazine(null);
                      setMagazineForm({ title: "", issue: "", description: "", published_at: "" });
                    }
                  }}
                >
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Magazine</DialogTitle>
                      <DialogDescription>Update magazine details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="m_title">Title</Label>
                        <Input
                          id="m_title"
                          value={magazineForm.title}
                          onChange={(e) => setMagazineForm({ ...magazineForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="m_issue">Issue</Label>
                        <Input
                          id="m_issue"
                          value={magazineForm.issue}
                          onChange={(e) => setMagazineForm({ ...magazineForm, issue: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="m_description">Description</Label>
                        <Textarea
                          id="m_description"
                          value={magazineForm.description}
                          onChange={(e) => setMagazineForm({ ...magazineForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="m_published_at">Published Date</Label>
                        <Input
                          id="m_published_at"
                          type="date"
                          value={magazineForm.published_at}
                          onChange={(e) => setMagazineForm({ ...magazineForm, published_at: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={() => updateMagazineMutation.mutate()}
                        disabled={!editingMagazine || !magazineForm.title}
                      >
                        Update Magazine
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {magazines?.map((magazine) => (
                        <TableRow key={magazine.id}>
                          <TableCell className="font-medium">{magazine.title}</TableCell>
                          <TableCell>{magazine.issue}</TableCell>
                          <TableCell>
                            {magazine.published_at
                              ? new Date(magazine.published_at).toLocaleDateString()
                              : ""}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMagazine(magazine);
                                  setMagazineForm({
                                    title: magazine.title,
                                    issue: magazine.issue || "",
                                    description: magazine.description || "",
                                    published_at: magazine.published_at
                                      ? magazine.published_at.slice(0, 10)
                                      : "",
                                  });
                                  setMagazineDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMagazineMutation.mutate(magazine.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                <div className="overflow-x-auto">
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
                          <Select value={user.role} onValueChange={(value) => updateUserRoleMutation.mutate({ userId: user.id, role: value as "student" | "instructor" | "admin" })}>
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
                          <Select value={user.category_id ?? "none"} onValueChange={(value) => updateUserCategoryMutation.mutate({ userId: user.id, categoryId: value === "none" ? null : value })}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {categories?.map((cat) => (
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
                </div>
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
                <Button onClick={() => {
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                  setEditingCategoryId(null);
                  setCategoryDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />Create Category
                </Button>

                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategoryId ? "Edit" : "Create"} Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cat_name">Category Name</Label>
                        <Input id="cat_name" placeholder="e.g., Military Officers" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cat_desc">Description</Label>
                        <Textarea id="cat_desc" placeholder="Category description" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} />
                      </div>
                      <Button onClick={() => createCategoryMutation.mutate()} disabled={!newCategoryName}>
                        {editingCategoryId ? "Update" : "Create"} Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="overflow-x-auto">
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
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setNewCategoryName(category.name);
                              setNewCategoryDescription(category.description);
                              setEditingCategoryId(category.id);
                              setCategoryDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
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

            <div className="overflow-x-auto">
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
                    {pgPrograms?.map((program) => (
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Key platform metrics and trends</CardDescription>
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
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="border rounded-md p-4">
                    <div className="font-semibold mb-2">Student Enrollment Trend (12 months)</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={enrollmentTrend}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Enrollments" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="font-semibold mb-2">Course Completion Rate (12 months)</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={completionRateTrend}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(val) => `${val}%`} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="Completion %" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border rounded-md p-4 lg:col-span-2">
                    <div className="font-semibold mb-2">Student Categories</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={analyticsData?.map(d => ({ name: d.category_name, value: d.student_count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                          {analyticsData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="font-semibold mb-2">Personnel Category Distribution</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={personnelCategoryCounts}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border rounded-md p-4 lg:col-span-2">
                    <div className="font-semibold mb-2">Document Upload Volume by Department</div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={docVolumeByDept}>
                        <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Uploads" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Support paperless policy among registered personnel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personnel?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.full_name}</TableCell>
                        <TableCell>{p.department}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => {
                            setDocumentsOwner(p);
                            setDocumentsDialogOpen(true);
                            refreshDocumentsList(p.id);
                          }}>Manage Docs</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid gap-4 md:hidden">
                  {(pgPrograms || []).map((program) => (
                    <div key={program.id} className="border rounded-md p-4 space-y-2">
                      <div className="font-semibold">{program.department}</div>
                      <div className="text-sm text-muted-foreground">{program.degree_types}</div>
                      {program.specializations && program.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {program.specializations.slice(0, 3).map((spec: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{spec}</Badge>
                          ))}
                          {program.specializations.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{program.specializations.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="pt-2 flex gap-2">
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
                          Edit
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
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:hidden">
                  {(personnel || []).map((p) => (
                    <div key={p.id} className="border rounded-md p-4 space-y-2">
                      <div className="font-semibold">{p.full_name}</div>
                      <div className="text-sm text-muted-foreground">{p.department}</div>
                      <div>
                        <Badge variant="outline">{p.category}</Badge>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDocumentsOwner(p);
                            setDocumentsDialogOpen(true);
                            refreshDocumentsList(p.id);
                          }}
                        >
                          Manage Docs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{documentsOwner?.full_name || "Documents"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Input type="file" multiple onChange={(e) => handleDocumentsUpload(e)} />
                        <Button onClick={() => refreshDocumentsList(documentsOwner?.id)} disabled={!documentsOwner}>Refresh</Button>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documentsList.map((doc) => (
                          <div key={doc.name} className="border rounded-md p-3 space-y-2">
                            <div className="text-sm font-semibold break-all">{doc.name}</div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => previewDocument(documentsOwner?.id, doc.name)}>Preview</Button>
                              <Button variant="destructive" size="sm" onClick={() => deleteDocument(documentsOwner?.id, doc.name)}>Delete</Button>
                            </div>
                          </div>
                        ))}
                        {documentsList.length === 0 && (
                          <div className="text-muted-foreground">No documents found.</div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="about-management">
            <Card>
              <CardHeader>
                <CardTitle>About Page Management Section</CardTitle>
                <CardDescription>Select and order management profiles shown on the About page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold mb-2">Personnel Candidates</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(personnel || []).map((p) => {
                          const exists = (leadership || []).some((l: LeadershipRow) => l.full_name === p.full_name);
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.full_name}</TableCell>
                              <TableCell>{p.department}</TableCell>
                              <TableCell>{p.position}</TableCell>
                              <TableCell>
                                {!exists ? (
                                  <Button size="sm" onClick={async () => {
                                    const { error } = await supabase.from("leadership").insert([{ 
                                      full_name: p.full_name,
                                      position: p.position || "",
                                      rank: p.rank || "",
                                      bio: p.bio || "",
                                      photo_url: p.photo_url || "",
                                      display_order: 0,
                                    }]);
                                    if (error) {
                                      toast({ title: "Error", description: error.message, variant: "destructive" });
                                    } else {
                                      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
                                      toast({ title: "Added", description: "Profile added to About Management" });
                                    }
                                  }}>Add</Button>
                                ) : (
                                  <Button variant="destructive" size="sm" onClick={async () => {
                                    const { error } = await supabase.from("leadership").delete().eq("full_name", p.full_name);
                                    if (error) {
                                      toast({ title: "Error", description: error.message, variant: "destructive" });
                                    } else {
                                      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
                                      toast({ title: "Removed", description: "Profile removed from About Management" });
                                    }
                                  }}>Remove</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Current Management (About)</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Update</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(leadership || []).map((l: LeadershipRow) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.full_name}</TableCell>
                            <TableCell>{l.position}</TableCell>
                            <TableCell>
                              <Input className="w-20" type="number" value={l.display_order ?? 0} onChange={async (e) => {
                                const val = Number(e.target.value || 0);
                                const { error } = await supabase.from("leadership").update({ display_order: val }).eq("id", l.id);
                                if (error) {
                                  toast({ title: "Error", description: error.message, variant: "destructive" });
                                } else {
                                  queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
                                }
                              }} />
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={async () => {
                                const { error } = await supabase.from("leadership").update({ position: l.position, rank: l.rank, bio: l.bio, photo_url: l.photo_url }).eq("id", l.id);
                                if (error) {
                                  toast({ title: "Error", description: error.message, variant: "destructive" });
                                } else {
                                  queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
                                  toast({ title: "Updated", description: "Leadership profile saved" });
                                }
                              }}>Save</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gallery">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Video className="h-4 w-4" />Video Gallery</CardTitle>
                  <CardDescription>Add YouTube links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="v_title">Title</Label>
                    <Input id="v_title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="v_url">YouTube URL</Label>
                    <Input id="v_url" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addVideo} disabled={!videoForm.url}><Plus className="mr-2 h-4 w-4" />Add Video</Button>
                    <Button variant="outline" onClick={() => { persistVideos([]); toast({ title: "Cleared", description: "All videos removed" }); }}>Clear Videos</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(galleryVideos || []).map((v: GalleryVideo) => {
                        const idMatch = String(v.url || "").match(/[?&]v=([^&]+)/) || String(v.url || "").match(/youtu\.be\/([^?]+)/);
                        const id = idMatch ? idMatch[1] : "";
                        return (
                          <TableRow key={v.id}>
                            <TableCell>
                              {id ? (
                                <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={v.title || "Video"} className="w-24 h-16 object-cover rounded" />
                              ) : (
                                <span className="text-muted-foreground">Invalid URL</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{v.title || "Untitled"}</TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" onClick={() => deleteVideo(v.id)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Picture Gallery</CardTitle>
                  <CardDescription>Add image URLs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="p_title">Caption</Label>
                    <Input id="p_title" value={pictureForm.title} onChange={(e) => setPictureForm({ ...pictureForm, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="p_url">Image URL</Label>
                    <Input id="p_url" value={pictureForm.image_url} onChange={(e) => setPictureForm({ ...pictureForm, image_url: e.target.value })} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={addPicture} disabled={!pictureForm.image_url}><Plus className="mr-2 h-4 w-4" />Add Picture</Button>
                  <Button variant="outline" onClick={() => { persistPictures([]); toast({ title: "Cleared", description: "All pictures removed" }); }}>Clear Pictures</Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Caption</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(galleryPictures || []).map((p: GalleryPicture) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <img src={p.image_url} alt={p.title || "Picture"} className="w-24 h-16 object-cover rounded" />
                          </TableCell>
                          <TableCell className="font-medium">{p.title || "Untitled"}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => deletePicture(p.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="grid gap-4 md:hidden">
                    {(galleryPictures || []).map((p) => (
                      <div key={p.id} className="border rounded-md p-4 space-y-2">
                        <img src={p.image_url} alt={p.title || "Picture"} className="w-full h-48 object-cover rounded" />
                        <div className="font-semibold">{p.title || "Untitled"}</div>
                        <div className="pt-2">
                          <Button variant="destructive" size="sm" onClick={() => deletePicture(p.id)} className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
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

export default AdminDashboard;
