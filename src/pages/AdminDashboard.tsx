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
import { supabaseClient } from "@/lib/supabase";
import { Newspaper, Trash2, Plus, Users, GraduationCap, Edit, BarChart3, Shield, BookOpen, UserCog, Crown, FileText, Database as DatabaseIcon, Image as ImageIcon, Video } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MagazineUploadDialog } from "@/components/MagazineUploadDialog";
import { Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import dicLogo from "@/assets/dic-logo.png";

const supabase = supabaseClient;

const categoryClasses = (name?: string) => {
  const n = String(name || "").toLowerCase();
  if (/military/.test(n)) return "bg-green-600 text-white";
  if (/civilian/.test(n)) return "bg-blue-600 text-white";
  if (/post|graduate|pg/.test(n)) return "bg-purple-600 text-white";
  if (/diploma|certificate|short/.test(n)) return "bg-amber-500 text-black";
  return "bg-slate-600 text-white";
};

const normalizePersonnelCategory = (raw?: string | null) => {
  const value = String(raw || "").toLowerCase().trim();
  if (!value) return "civilian";
  if (value === "military" || value === "civilian") return value;
  if (
    value.includes("dia") ||
    value.includes("navy") ||
    value.includes("army") ||
    value.includes("air") ||
    value.includes("forces")
  ) {
    return "military";
  }
  if (value.includes("civil")) return "civilian";
  return "civilian";
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
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [newsCategory, setNewsCategory] = useState<string>("");
  
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
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);
  const [galleryPictures, setGalleryPictures] = useState<GalleryPicture[]>([]);
  const [editingGalleryVideoId, setEditingGalleryVideoId] = useState<string | null>(null);
  const [editingGalleryPictureId, setEditingGalleryPictureId] = useState<string | null>(null);
  const [homeVideoSettingId, setHomeVideoSettingId] = useState<string | null>(null);
  const [homeVideoUrlSetting, setHomeVideoUrlSetting] = useState("");
  const [homeVideoSaving, setHomeVideoSaving] = useState(false);
  const [gallerySaving, setGallerySaving] = useState(false);
  const saveGalleryVideo = async () => {
    if (!videoForm.url) return;
    try {
      setGallerySaving(true);
      if (editingGalleryVideoId) {
        const { error } = await supabase
          .from("gallery_videos")
          .update({ title: videoForm.title || "Untitled", url: videoForm.url })
          .eq("id", editingGalleryVideoId);
        if (error) throw error;
        setGalleryVideos(list =>
          list.map(v =>
            v.id === editingGalleryVideoId ? { ...v, title: videoForm.title || "Untitled", url: videoForm.url } : v,
          ),
        );
        toast({ title: "Saved", description: "Video updated" });
      } else {
        const { data, error } = await supabase
          .from("gallery_videos")
          .insert([{ title: videoForm.title || "Untitled", url: videoForm.url }])
          .select("id, title, url")
          .single();
        if (error) throw error;
        const newVideo: GalleryVideo = {
          id: data.id,
          title: data.title || "Untitled",
          url: data.url,
        };
        setGalleryVideos(list => [newVideo, ...list]);
        toast({ title: "Saved", description: "Video added to gallery" });
      }
      setVideoForm({ title: "", url: "" });
      setEditingGalleryVideoId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGallerySaving(false);
    }
  };
  const deleteVideo = async (id: string) => {
    try {
      setGallerySaving(true);
      const { error } = await supabase
        .from("gallery_videos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setGalleryVideos(list => list.filter(v => v.id !== id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGallerySaving(false);
    }
  };
  const saveGalleryPicture = async () => {
    if (!pictureForm.image_url) return;
    try {
      setGallerySaving(true);
      if (editingGalleryPictureId) {
        const { error } = await supabase
          .from("gallery_pictures")
          .update({ title: pictureForm.title || "Untitled", image_url: pictureForm.image_url })
          .eq("id", editingGalleryPictureId);
        if (error) throw error;
        setGalleryPictures(list =>
          list.map(p =>
            p.id === editingGalleryPictureId
              ? { ...p, title: pictureForm.title || "Untitled", image_url: pictureForm.image_url }
              : p,
          ),
        );
        toast({ title: "Saved", description: "Picture updated" });
      } else {
        const { data, error } = await supabase
          .from("gallery_pictures")
          .insert([{ title: pictureForm.title || "Untitled", image_url: pictureForm.image_url }])
          .select("id, title, image_url")
          .single();
        if (error) throw error;
        const newPicture: GalleryPicture = {
          id: data.id,
          title: data.title || "Untitled",
          image_url: data.image_url,
        };
        setGalleryPictures(list => [newPicture, ...list]);
        toast({ title: "Saved", description: "Picture added to gallery" });
      }
      setPictureForm({ title: "", image_url: "" });
      setEditingGalleryPictureId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGallerySaving(false);
    }
  };
  const deletePicture = async (id: string) => {
    try {
      setGallerySaving(true);
      const { error } = await supabase
        .from("gallery_pictures")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setGalleryPictures(list => list.filter(p => p.id !== id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setGallerySaving(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const loadGallery = async () => {
      try {
        const { data: videos, error: videosError } = await supabase
          .from("gallery_videos")
          .select("*")
          .order("created_at", { ascending: false });
        if (!videosError && videos) {
          setGalleryVideos(
            (videos as { id: string; title: string | null; url: string }[]).map(v => ({
              id: v.id,
              title: v.title || "",
              url: v.url,
            })),
          );
        }
        const { data: pictures, error: picturesError } = await supabase
          .from("gallery_pictures")
          .select("*")
          .order("created_at", { ascending: false });
        if (!picturesError && pictures) {
          setGalleryPictures(
            (pictures as { id: string; title: string | null; image_url: string }[]).map(p => ({
              id: p.id,
              title: p.title || "",
              image_url: p.image_url,
            })),
          );
        }
      } catch {
        return;
      }
    };
    loadGallery();
  }, [isAdmin]);

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
  type CertificateRow = {
    id: string;
    student_id: string;
    course_id: string;
    certificate_code: string;
    issued_at: string;
    profiles?: { full_name?: string | null } | null;
    courses?: { title?: string | null } | null;
  };

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

  const handleNewsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewsImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setNewsImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
    title: "",
    description: "",
    full_description: "",
    category: "Generic Courses",
    is_paid: false,
    price: "",
    currency: "NGN",
    duration_weeks: "",
    instructor_id: "",
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  type PersonnelRow = Database["public"]["Tables"]["personnel"]["Row"];
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const [populatingAll, setPopulatingAll] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bucketName, setBucketName] = useState<string>(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? "magazines");
  const mapStorageError = (msg: string) => (/bucket\s*not\s*found/i.test(msg) ? `Storage bucket '${bucketName}' not found. Create it in Supabase Storage or set VITE_SUPABASE_STORAGE_BUCKET.` : msg);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateUserId, setCertificateUserId] = useState<string | null>(null);
  const [certificateCourseId, setCertificateCourseId] = useState<string>("");
  const [certificateFilterCourseId, setCertificateFilterCourseId] = useState<string>("all");
  const [certificateFilterUserId, setCertificateFilterUserId] = useState<string>("all");
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const [commandantSignatureUrl, setCommandantSignatureUrl] = useState<string>("");
  const [directorSignatureUrl, setDirectorSignatureUrl] = useState<string>("");
  const [watermarkUrl, setWatermarkUrl] = useState<string>("/certificate-seal.png");
  const generateCertificateCode = (title?: string) => {
    const words = String(title || "COURSE").split(/\s+/).filter(Boolean);
    const abbr = words.map((w) => w.replace(/[^A-Za-z]/g, "")[0] || "").join("").slice(0, 5).toUpperCase() || "COURSE";
    const num = String(Math.floor(10000000 + Math.random() * 90000000));
    return `DIC-${abbr}-${num}`;
  };
  const uploadSignatureImage = async (file: File, role: "commandant" | "director_strategic") => {
    const path = `signatures/${role}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucketName).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = await supabase.storage.from(bucketName).getPublicUrl(path);
    if (role === "commandant") setCommandantSignatureUrl(publicUrl);
    else setDirectorSignatureUrl(publicUrl);
  };
  const uploadWatermarkImage = async (file: File) => {
    const path = `signatures/watermark/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucketName).upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = await supabase.storage.from(bucketName).getPublicUrl(path);
    setWatermarkUrl(publicUrl);
  };

  const loadLatestSignature = async (role: "commandant" | "director_strategic") => {
    const folder = `signatures/${role}`;
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folder, { limit: 100 });
      if (error || !data || data.length === 0) return;
      const pickLatestByName = [...data].sort((a, b) => {
        const ta = Number(String(a.name).split("-")[0]) || 0;
        const tb = Number(String(b.name).split("-")[0]) || 0;
        return tb - ta;
      })[0];
      if (!pickLatestByName?.name) return;
      const path = `${folder}/${pickLatestByName.name}`;
      const { data: urlData } = await supabase.storage.from(bucketName).getPublicUrl(path);
      if (!urlData?.publicUrl) return;
      if (role === "commandant") setCommandantSignatureUrl(urlData.publicUrl);
      else setDirectorSignatureUrl(urlData.publicUrl);
    } catch (_) {
      return;
    }
  };
  const loadLatestWatermark = async () => {
    const folder = `signatures/watermark`;
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(folder, { limit: 100 });
      if (error || !data || data.length === 0) return;
      const pickLatestByName = [...data].sort((a, b) => {
        const ta = Number(String(a.name).split("-")[0]) || 0;
        const tb = Number(String(b.name).split("-")[0]) || 0;
        return tb - ta;
      })[0];
      if (!pickLatestByName?.name) return;
      const path = `${folder}/${pickLatestByName.name}`;
      const { data: urlData } = await supabase.storage.from(bucketName).getPublicUrl(path);
      if (!urlData?.publicUrl) return;
      setWatermarkUrl(urlData.publicUrl);
    } catch (_) {
      return;
    }
  };

  const saveHomeVideoSetting = async (url?: string) => {
    const targetUrl = typeof url === "string" ? url : homeVideoUrlSetting;
    if (!targetUrl || !targetUrl.trim()) {
      toast({ title: "Missing URL", description: "Please enter a YouTube URL before saving", variant: "destructive" });
      return;
    }
    try {
      setHomeVideoSaving(true);
      const payload = {
        title: "home_video_url",
        message: targetUrl,
        type: "setting",
        user_id: "public",
      };
      // Robust update-or-insert flow
      let targetId = homeVideoSettingId;
      if (!targetId) {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("type", "setting")
          .eq("title", "home_video_url")
          .maybeSingle();
        if (existing?.id) targetId = existing.id;
      }
      if (targetId) {
        const { error } = await supabase.from("notifications").update(payload).eq("id", targetId);
        if (error) throw error;
        setHomeVideoSettingId(targetId);
      } else {
        const { data, error } = await supabase.from("notifications").insert([payload]).select("id").single();
        if (error) throw error;
        setHomeVideoSettingId(data.id);
      }
      setHomeVideoUrlSetting(targetUrl || "");
      toast({ title: "Saved", description: "Home page video updated" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save home page video URL";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setHomeVideoSaving(false);
    }
  };

  useEffect(() => {
    const detectBucket = async () => {
      const candidates = [bucketName, "magazines", "public", "files", "uploads", "avatars"];
      for (const name of candidates) {
        try {
          const { error } = await supabase.storage.from(name).list("", { limit: 1 });
          if (!error) { setBucketName(name); return; }
        } catch (_) { void 0; }
      }
    };
    detectBucket();
  }, [bucketName]);

  useEffect(() => {
    loadLatestSignature("commandant");
    loadLatestSignature("director_strategic");
    loadLatestWatermark();
  }, [bucketName]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadHomeVideoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, message")
          .eq("type", "setting")
          .eq("title", "home_video_url")
          .maybeSingle();
        if (error) return;
        if (data) {
          setHomeVideoSettingId(data.id);
          if (typeof data.message === "string") {
            setHomeVideoUrlSetting(data.message || "");
          } else {
            setHomeVideoUrlSetting("");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadHomeVideoSetting();
  }, [isAdmin]);

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
      let featuredImageUrl: string | null = newsFeaturedImage || null;
      if (newsImageFile) {
        const timestamp = Date.now();
        const path = `news/${timestamp}-${newsImageFile.name}`;
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(path, newsImageFile);
        if (error) throw new Error(mapStorageError(error.message));
        const { data: { publicUrl } } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(path);
        featuredImageUrl = publicUrl;
      }
      const payloadWithImage: { title: string; content: string; featured_image_url?: string | null } = {
        title: newsTitle,
        content: newsContent,
      };
      const categoriesAllowed = ["Promotions", "Events", "Interviews", "Announcements"];
      const categoryValue = categoriesAllowed.includes(newsCategory) ? newsCategory : null;
      if (featuredImageUrl) payloadWithImage.featured_image_url = featuredImageUrl;
      if (editingNewsId) {
        try {
          const { error } = await supabase
            .from("news")
            .update(categoryValue ? { ...payloadWithImage, category: categoryValue } : payloadWithImage)
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
            .insert([categoryValue ? { ...payloadWithImage, category: categoryValue } : payloadWithImage]);
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
      setNewsCategory("");
      setEditingNewsId(null);
      setNewsFeaturedImage("");
      setNewsImageFile(null);
      setNewsImagePreview(null);
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

  // Documents feature removed

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

  const { data: personnel } = useQuery<PersonnelRow[]>({
    queryKey: ["admin-personnel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PersonnelRow[];
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
    category?: string | null;
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

  

  type CategoryRow = Database["public"]["Tables"]["student_categories"]["Row"];
  const { data: categories } = useQuery<CategoryRow[]>({
    queryKey: ["student-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CategoryRow[];
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
  const { data: certificates } = useQuery<CertificateRow[]>({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      return [] as CertificateRow[];
    },
    enabled: isAdmin,
  });
  const filteredCertificates = (certificates || []).filter((c) => {
    const byCourse = certificateFilterCourseId === "all" ? true : c.course_id === certificateFilterCourseId;
    const byUser = certificateFilterUserId === "all" ? true : c.student_id === certificateFilterUserId;
    return byCourse && byUser;
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
    // Documents analytics removed
  }, [isAdmin, personnel, bucketName]);



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
      const priceNumber = courseForm.price ? Number(courseForm.price) : NaN;
      const priceCents = Number.isFinite(priceNumber) && priceNumber > 0 ? Math.round(priceNumber * 100) : null;
      const durationNumber = courseForm.duration_weeks ? Number(courseForm.duration_weeks) : NaN;
      const durationWeeks = Number.isFinite(durationNumber) && durationNumber > 0 ? durationNumber : null;
      const instructorId = courseForm.instructor_id || user.id;
      
      if (editingCourseId) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: courseForm.title,
            description: courseForm.description,
            full_description: courseForm.full_description,
            category: courseForm.category,
            is_paid: courseForm.is_paid,
            price_cents: priceCents,
            duration_weeks: durationWeeks,
            instructor_id: instructorId,
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
            is_paid: courseForm.is_paid,
            price_cents: priceCents,
            duration_weeks: durationWeeks,
            instructor_id: instructorId,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setCourseForm({
        title: "",
        description: "",
        full_description: "",
        category: "Generic Courses",
        is_paid: false,
        price: "",
        currency: "NGN",
        duration_weeks: "",
        instructor_id: "",
      });
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
      const now = new Date().toISOString();
      const payload = {
        ...personnelForm,
        category: normalizePersonnelCategory(personnelForm.category),
        photo_url: photoUrl,
      };
      if (editingPersonnelId) {
        const { error } = await supabase
          .from("personnel")
          .update({ ...payload, updated_at: now })
          .eq("id", editingPersonnelId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("personnel")
          .insert([{ ...payload, created_at: now, updated_at: now }]);
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
      const message =
        typeof (error as { message?: unknown })?.message === "string"
          ? String((error as { message?: unknown }).message)
          : error instanceof Error
          ? error.message
          : "Failed to save personnel";
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

  const toReadableError = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const obj = err as Record<string, unknown>;
      const directMsg = obj.message;
      if (typeof directMsg === "string") return directMsg;
      const nestedErr = obj.error as { message?: unknown } | undefined;
      if (nestedErr && typeof nestedErr.message === "string") return nestedErr.message as string;
      let json = "";
      try {
        json = JSON.stringify(err);
      } catch (_e) {
        json = "";
      }
      if (json && json !== "{}") return json;
    }
    return "Unknown error";
  };
  const manualEnrollMutation = useMutation<unknown, unknown, { studentId: string; courseId: string }>({
    mutationFn: async ({ studentId, courseId }) => {
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();
      if (courseError) throw courseError;
      if (!course) throw new Error("Course not found");

      if (course.is_paid && course.price_cents && course.price_cents > 0) {
        const { error: paymentError } = await supabase.from("payments").insert([
          {
            student_id: studentId,
            course_id: courseId,
            amount_cents: course.price_cents,
            currency: "NGN",
            status: "succeeded",
            provider: "admin",
            reference: crypto.randomUUID(),
          },
        ]);
        if (paymentError) throw paymentError;

        try {
          const { error: enrollmentError } = await supabase.from("enrollments").insert([
            {
              student_id: studentId,
              course_id: courseId,
              payment_status: "succeeded",
              access_state: "active",
            },
          ]);
          if (enrollmentError) throw enrollmentError;
        } catch (e: unknown) {
          const msg = toReadableError(e);
          if (msg.includes("access_state") || msg.includes("payment_status") || msg.includes("schema cache")) {
            const { error: retryError } = await supabase.from("enrollments").insert([
              {
                student_id: studentId,
                course_id: courseId,
              },
            ]);
            if (retryError) throw retryError;
          } else {
            throw e;
          }
        }
      } else {
        try {
          const { error: enrollmentError } = await supabase.from("enrollments").insert([
            {
              student_id: studentId,
              course_id: courseId,
              payment_status: "free",
              access_state: "active",
            },
          ]);
          if (enrollmentError) throw enrollmentError;
        } catch (e: unknown) {
          const msg = toReadableError(e);
          if (msg.includes("access_state") || msg.includes("payment_status") || msg.includes("schema cache")) {
            const { error: retryError } = await supabase.from("enrollments").insert([
              {
                student_id: studentId,
                course_id: courseId,
              },
            ]);
            if (retryError) throw retryError;
          } else {
            throw e;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast({ title: "Success", description: "User enrolled in course" });
    },
    onError: (error: unknown) => {
      const message = toReadableError(error);
      toast({
        title: "Enrollment failed",
        description: message.includes("duplicate key") ? "User is already enrolled in this course" : message,
        variant: "destructive",
      });
    },
  });

  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [enrollmentUserId, setEnrollmentUserId] = useState<string | null>(null);
  const [enrollmentCourseId, setEnrollmentCourseId] = useState<string>("");
  const issueCertificateMutation = useMutation<unknown, unknown, { studentId: string; courseId: string }>({
    mutationFn: async () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast({ title: "Success", description: "Certificate issued" });
      setCertificateDialogOpen(false);
      setCertificateUserId(null);
      setCertificateCourseId("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message.includes("duplicate key") ? "Certificate already exists" : message, variant: "destructive" });
    },
  });
  const revokeCertificateMutation = useMutation<unknown, unknown, { studentId: string; courseId: string }>({
    mutationFn: async () => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      toast({ title: "Success", description: "Certificate revoked" });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Error", description: message, variant: "destructive" });
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
            <TabsTrigger value="about-management" className="h-full whitespace-normal min-h-[44px]"><Crown className="mr-1 h-4 w-4" />Members of Faculty</TabsTrigger>
            <TabsTrigger value="gallery" className="h-full whitespace-normal min-h-[44px]"><ImageIcon className="mr-1 h-4 w-4" />Gallery</TabsTrigger>
            <TabsTrigger value="certificates" className="h-full whitespace-normal min-h-[44px]"><GraduationCap className="mr-1 h-4 w-4" />Certificates</TabsTrigger>
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
                    setCourseForm({
                      title: "",
                      description: "",
                      full_description: "",
                      category: "Generic Courses",
                      is_paid: false,
                      price: "",
                      currency: "NGN",
                      duration_weeks: "",
                      instructor_id: "",
                    });
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
                      <div className="grid gap-2">
                        <Label>Instructor</Label>
                        <Select
                          value={courseForm.instructor_id}
                          onValueChange={(value) => setCourseForm({ ...courseForm, instructor_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Assign instructor" />
                          </SelectTrigger>
                          <SelectContent>
                            {(users || [])
                              .filter((u) => u.role === "instructor")
                              .map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.full_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Course Type</Label>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">
                            {courseForm.is_paid ? "Paid course" : "Free course"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Free</span>
                            <Switch
                              checked={courseForm.is_paid}
                              onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_paid: checked })}
                            />
                            <span className="text-xs text-muted-foreground">Paid</span>
                          </div>
                        </div>
                      </div>
                      {courseForm.is_paid && (
                        <div className="grid gap-2">
                          <Label>Pricing</Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Select
                              value={courseForm.currency}
                              onValueChange={(value) => setCourseForm({ ...courseForm, currency: value })}
                            >
                              <SelectTrigger className="w-full sm:w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NGN">NGN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={courseForm.price}
                              onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                              placeholder="Amount"
                            />
                          </div>
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label>Duration (weeks)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={courseForm.duration_weeks}
                          onChange={(e) => setCourseForm({ ...courseForm, duration_weeks: e.target.value })}
                          placeholder="e.g. 8"
                        />
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
                                title: course.title || "",
                                description: course.description || "",
                                full_description: course.full_description || "",
                                category: course.category || "Generic Courses",
                                is_paid: !!course.is_paid,
                                price: course.price_cents ? String(course.price_cents / 100) : "",
                                currency: "NGN",
                                duration_weeks: course.duration_weeks ? String(course.duration_weeks) : "",
                                instructor_id: course.instructor_id || "",
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
                        <Select
                          value={personnelForm.category}
                          onValueChange={(value) => setPersonnelForm({ ...personnelForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories && categories.length > 0 ? (
                              categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="civilian">Civilian</SelectItem>
                                <SelectItem value="military">Military</SelectItem>
                              </>
                            )}
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
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={async () => {
                    try {
                      const excludedNames = new Set([
                        "Dir Keneth Iheasirim",
                        "Lt Coll John Doe 3",
                        "Lt Commander John Doe 2",
                        "Dir John Doe 1",
                        "SDIO John Doe 4",
                      ]);
                      const personnelList = (personnel || []) as PersonnelRow[];
                        const targets = ((leadership || []) as LeadershipRow[]).filter((l) => excludedNames.has(String(l.full_name)));
                      for (const l of targets) {
                        const match = personnelList.find(p => p.full_name === l.full_name);
                        if (match && match.position && match.position !== l.position) {
                          const { error } = await supabase
                            .from("leadership")
                            .update({ position: match.position })
                            .eq("id", l.id);
                          if (error) throw error;
                        }
                      }
                        queryClient.setQueryData(["admin-leadership"], (old: unknown) => {
                          const list = (old as LeadershipRow[] | undefined) || [];
                          return list.map((row) => {
                            if (excludedNames.has(String(row.full_name))) {
                              const match = personnelList.find(p => p.full_name === row.full_name);
                              if (match?.position) return { ...row, position: match.position };
                            }
                            return row;
                          });
                        });
                      queryClient.invalidateQueries({ queryKey: ["admin-leadership"] });
                      toast({ title: "Synced", description: "Positions updated from Personnel" });
                    } catch (error: unknown) {
                      const message = error instanceof Error ? error.message : String(error);
                      toast({ title: "Error", description: message, variant: "destructive" });
                    }
                  }}
                >
                  Sync Positions from Personnel
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
                      {(() => {
                        const excludedNames = new Set([
                          "Dir Keneth Iheasirim",
                          "Lt Coll John Doe 3",
                          "Lt Commander John Doe 2",
                          "Dir John Doe 1",
                          "SDIO John Doe 4",
                        ]);
                        return (leadership || []).filter((l) => !excludedNames.has(l.full_name));
                      })().map((leader) => (
                        <TableRow key={leader.id}>
                          <TableCell>{leader.display_order}</TableCell>
                          <TableCell className="font-medium">{leader.full_name}</TableCell>
                          <TableCell>
                            <Select
                            value={leader.position || ""}
                            onValueChange={(value) => {
                              const excluded = new Set([
                                "Dir Keneth Iheasirim",
                                "Lt Coll John Doe 3",
                                "Lt Commander John Doe 2",
                                "Dir John Doe 1",
                                "SDIO John Doe 4",
                              ]);
                              if (value === "Commandant DIC" && excluded.has(leader.full_name)) {
                                toast({ title: "Blocked", description: "This profile cannot be set as Commandant DIC", variant: "destructive" });
                                return;
                              }
                              updateLeadershipStatusMutation.mutate({ id: leader.id, is_active: !!leader.is_active, position: value });
                            }}
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
                  setNewsImageFile(null);
                  setNewsImagePreview(null);
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
                        <Label htmlFor="news_category">Category</Label>
                        <Select value={newsCategory} onValueChange={setNewsCategory}>
                          <SelectTrigger id="news_category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Promotions">Promotions</SelectItem>
                            <SelectItem value="Events">Events</SelectItem>
                            <SelectItem value="Interviews">Interviews</SelectItem>
                            <SelectItem value="Announcements">Announcements</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="news_content">Content</Label>
                        <Textarea id="news_content" placeholder="News content" value={newsContent} onChange={(e) => setNewsContent(e.target.value)} rows={4} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Featured Image (optional)</Label>
                        <div className="flex items-start gap-4">
                          <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">
                              {newsImageFile ? newsImageFile.name : "Click to upload featured image"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleNewsImageChange}
                              className="hidden"
                            />
                          </label>
                          {(newsImagePreview || newsFeaturedImage) && (
                            <img
                              src={newsImagePreview || newsFeaturedImage}
                              alt="Featured preview"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          )}
                        </div>
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
                                    setNewsImageFile(null);
                                    setNewsImagePreview(item.featured_image_url || null);
                              setEditingNewsId(item.id);
                              setNewsCategory(item.category || "");
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
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="w-fit">
                                {user.role}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-[32px]"
                                onClick={() => {
                                  setEnrollmentUserId(user.id);
                                  setEnrollmentCourseId("");
                                  setEnrollmentDialogOpen(true);
                                }}
                              >
                                Enroll in Course
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Dialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen}>
                  <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                      <DialogTitle>Enroll User in Course</DialogTitle>
                      <DialogDescription>
                        Select a course to enroll this user. Paid courses will record a successful payment.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>User</Label>
                        <Input
                          value={users?.find((u) => u.id === enrollmentUserId)?.full_name || ""}
                          disabled
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Course</Label>
                        <Select
                          value={enrollmentCourseId}
                          onValueChange={setEnrollmentCourseId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses?.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        disabled={!enrollmentUserId || !enrollmentCourseId || manualEnrollMutation.isPending}
                        onClick={() => {
                          if (!enrollmentUserId || !enrollmentCourseId) return;
                          manualEnrollMutation.mutate({
                            studentId: enrollmentUserId as string,
                            courseId: enrollmentCourseId,
                          });
                        }}
                      >
                        {manualEnrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Manage student and personnel categories</CardDescription>
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Personnel Categories</CardTitle>
                <CardDescription>Update personnel category assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Update</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(personnel || []).map((p: PersonnelRow) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.full_name}</TableCell>
                          <TableCell>{p.position}</TableCell>
                          <TableCell>
                            <Select
                              value={normalizePersonnelCategory(p.category)}
                              onValueChange={async (value) => {
                                const normalized = normalizePersonnelCategory(value);
                                const { error } = await supabase
                                  .from("personnel")
                                  .update({ category: normalized })
                                  .eq("id", p.id);
                                if (error) {
                                  toast({ title: "Error", description: error.message, variant: "destructive" });
                                } else {
                                  queryClient.setQueryData(["admin-personnel"], (old: unknown) => {
                                    const list = (old as PersonnelRow[] | undefined) || [];
                                    return list.map((row) => (row.id === p.id ? { ...row, category: normalized } : row));
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["admin-personnel"] });
                                  toast({ title: "Saved", description: "Personnel category updated" });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="military">Military</SelectItem>
                                <SelectItem value="military">DIA</SelectItem>
                                <SelectItem value="civilian">NYSC Members</SelectItem>
                                <SelectItem value="civilian">Civilians</SelectItem>
                                <SelectItem value="civilian">Casual Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            
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

                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="border rounded-md p-4">
                    <div className="font-semibold mb-2">Personnel Categories</div>
                    {(() => {
                      const totals = { military: 0, civilian: 0 };
                      (personnel || []).forEach((p) => {
                        const v = normalizePersonnelCategory(p.category);
                        if (v === "military") totals.military += 1;
                        else totals.civilian += 1;
                      });
                      const pieData = [
                        { name: "Military", value: totals.military },
                        { name: "Civilian", value: totals.civilian },
                      ];
                      const colors = ["#16a34a", "#3b82f6"];
                      return (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Tooltip />
                            <Legend />
                            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
          <TabsContent value="about-management">
            <Card>
              <CardHeader>
                <CardTitle>Members of Faculty</CardTitle>
                <CardDescription>Select and order faculty members shown on the About page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold mb-2">Faculty Candidates</div>
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
                    <div className="font-semibold mb-2">Current Members of Faculty</div>
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
                    <Label htmlFor="home_video_url">Home Page Video URL</Label>
                    <Input
                      id="home_video_url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={homeVideoUrlSetting}
                      onChange={(e) => setHomeVideoUrlSetting(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="min-h-[40px]"
                        onClick={() => saveHomeVideoSetting()}
                        disabled={homeVideoSaving}
                      >
                        Save Home Video
                      </Button>
                      {galleryVideos.length > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="min-h-[40px]"
                          onClick={() => saveHomeVideoSetting(galleryVideos[0].url)}
                          disabled={homeVideoSaving}
                        >
                          Use First Gallery Video
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="v_title">Title</Label>
                    <Input id="v_title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="v_url">YouTube URL</Label>
                    <Input id="v_url" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveGalleryVideo} disabled={!videoForm.url || gallerySaving}>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingGalleryVideoId ? "Update Video" : "Add Video"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={gallerySaving}
                      onClick={async () => {
                        try {
                          setGallerySaving(true);
                          const { error } = await supabase
                            .from("gallery_videos")
                            .delete();
                          if (error) throw error;
                          setGalleryVideos([]);
                          toast({ title: "Cleared", description: "All videos removed" });
                        } catch (error: unknown) {
                          const message = error instanceof Error ? error.message : String(error);
                          toast({ title: "Error", description: message, variant: "destructive" });
                        } finally {
                          setGallerySaving(false);
                        }
                      }}
                    >
                      Clear Videos
                    </Button>
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
                          <TableRow key={v.id} className={homeVideoUrlSetting && v.url === homeVideoUrlSetting ? "bg-muted/60" : ""}>
                            <TableCell>
                              {id ? (
                                <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={v.title || "Video"} className="w-24 h-16 object-cover rounded" />
                              ) : (
                                <span className="text-muted-foreground">Invalid URL</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col gap-1">
                                <span>{v.title || "Untitled"}</span>
                                {homeVideoUrlSetting && v.url === homeVideoUrlSetting && (
                                  <span className="text-xs text-primary font-medium">Home page video</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setVideoForm({ title: v.title, url: v.url });
                                    setEditingGalleryVideoId(v.id);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => saveHomeVideoSetting(v.url)}
                                >
                                  Make Home Video
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteVideo(v.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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
                  <CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Events Gallery</CardTitle>
                  <CardDescription>Manage images that appear on News page Events Gallery</CardDescription>
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
                    <Button onClick={saveGalleryPicture} disabled={!pictureForm.image_url || gallerySaving}>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingGalleryPictureId ? "Update Picture" : "Add Picture"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={gallerySaving}
                      onClick={async () => {
                        try {
                          setGallerySaving(true);
                          const demos = [
                            { title: "Matriculation Ceremony", image_url: "https://picsum.photos/seed/dic-event-1/800/600" },
                            { title: "Guest Lecture", image_url: "https://picsum.photos/seed/dic-event-2/800/600" },
                            { title: "Training Session", image_url: "https://picsum.photos/seed/dic-event-3/800/600" },
                            { title: "Graduation Day", image_url: "https://picsum.photos/seed/dic-event-4/800/600" },
                            { title: "Campus Walkthrough", image_url: "https://picsum.photos/seed/dic-event-5/800/600" },
                            { title: "Awards Night", image_url: "https://picsum.photos/seed/dic-event-6/800/600" },
                          ];
                          const { data, error } = await supabase
                            .from("gallery_pictures")
                            .insert(demos)
                            .select("id, title, image_url");
                          if (error) throw error;
                          const inserted = ((data || []) as { id: string; title: string; image_url: string }[]).map((r) => ({ id: r.id, title: r.title, image_url: r.image_url })) as GalleryPicture[];
                          setGalleryPictures(list => [...inserted, ...list]);
                          toast({ title: "Seeded", description: "Demo pictures added to Events Gallery" });
                        } catch (error: unknown) {
                          const message = error instanceof Error ? error.message : String(error);
                          toast({ title: "Error", description: message, variant: "destructive" });
                        } finally {
                          setGallerySaving(false);
                        }
                      }}
                    >
                      Seed Demo Pictures
                    </Button>
                  <Button
                    variant="outline"
                    disabled={gallerySaving}
                    onClick={async () => {
                      try {
                        setGallerySaving(true);
                        const { error } = await supabase
                          .from("gallery_pictures")
                          .delete();
                        if (error) throw error;
                        setGalleryPictures([]);
                        toast({ title: "Cleared", description: "All pictures removed" });
                      } catch (error: unknown) {
                        const message = error instanceof Error ? error.message : String(error);
                        toast({ title: "Error", description: message, variant: "destructive" });
                      } finally {
                        setGallerySaving(false);
                      }
                    }}
                  >
                    Clear Pictures
                  </Button>
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
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPictureForm({ title: p.title, image_url: p.image_url });
                                  setEditingGalleryPictureId(p.id);
                                }}
                              >
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => deletePicture(p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setPictureForm({ title: p.title, image_url: p.image_url });
                                setEditingGalleryPictureId(p.id);
                              }}
                            >
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deletePicture(p.id)} className="flex-1">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Issue and revoke course completion certificates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setCertificateUserId(null);
                      setCertificateCourseId("");
                      setCertificateDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />Issue Certificate
                  </Button>
                  <Select value={certificateFilterCourseId} onValueChange={setCertificateFilterCourseId}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {(courses || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={certificateFilterUserId} onValueChange={setCertificateFilterUserId}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Filter by user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {(users || []).map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
                  <DialogContent className="max-w-md w-full">
                    <DialogHeader>
                      <DialogTitle>Issue Certificate</DialogTitle>
                      <DialogDescription>Select a user and course</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>User</Label>
                        <Select
                          value={certificateUserId ?? ""}
                          onValueChange={(v) => setCertificateUserId(v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {(users || []).map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Course</Label>
                        <Select
                          value={certificateCourseId}
                          onValueChange={setCertificateCourseId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {(courses || []).map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const e = (enrollments || []).find((x) => x.student_id === certificateUserId && x.course_id === certificateCourseId);
                            const enrolled = !!e;
                            const completed = !!e && ((e.payment_status && String(e.payment_status).toLowerCase() === "succeeded") || (e.access_state && String(e.access_state).toLowerCase() === "active"));
                            return (
                              <>
                                <Badge variant={enrolled ? "default" : "outline"}>{enrolled ? "Enrolled" : "Not enrolled"}</Badge>
                                <Badge variant={completed ? "default" : "outline"}>{completed ? "Access granted" : "Access pending"}</Badge>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    <div className="grid gap-2">
                      <Label>Template</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCertificatePreviewOpen(true)}
                          disabled={!certificateUserId || !certificateCourseId}
                        >
                          Preview Template
                        </Button>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  await uploadWatermarkImage(file);
                                  toast({ title: "Uploaded", description: "Watermark updated" });
                                } catch (error: unknown) {
                                  const message = error instanceof Error ? error.message : String(error);
                                  toast({ title: "Error", description: message, variant: "destructive" });
                                }
                              }
                            }}
                          />
                          {watermarkUrl && (
                            <img src={watermarkUrl} alt="Watermark" className="h-8 w-8 object-contain rounded border" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Signatures</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Commandant</div>
                          <Input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                await uploadSignatureImage(file, "commandant");
                                toast({ title: "Uploaded", description: "Commandant signature saved" });
                              } catch (error: unknown) {
                                const message = error instanceof Error ? error.message : String(error);
                                toast({ title: "Error", description: message, variant: "destructive" });
                              }
                            }
                          }} />
                          {commandantSignatureUrl && (
                            <div className="h-20 border rounded flex items-center justify-center bg-muted/40">
                              <img src={commandantSignatureUrl} alt="Commandant Signature" className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Dir of Strategic Studies</div>
                          <Input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                await uploadSignatureImage(file, "director_strategic");
                                toast({ title: "Uploaded", description: "Director signature saved" });
                              } catch (error: unknown) {
                                const message = error instanceof Error ? error.message : String(error);
                                toast({ title: "Error", description: message, variant: "destructive" });
                              }
                            }
                          }} />
                          {directorSignatureUrl && (
                            <div className="h-20 border rounded flex items-center justify-center bg-muted/40">
                              <img src={directorSignatureUrl} alt="Director Signature" className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                      <Button
                        disabled={
                          !certificateUserId ||
                          !certificateCourseId ||
                          issueCertificateMutation.isPending ||
                          !(() => {
                            const e = (enrollments || []).find((x) => x.student_id === certificateUserId && x.course_id === certificateCourseId);
                            return !!e && ((e.payment_status && String(e.payment_status).toLowerCase() === "succeeded") || (e.access_state && String(e.access_state).toLowerCase() === "active"));
                          })()
                        }
                        onClick={() => {
                          if (!certificateUserId || !certificateCourseId) return;
                          issueCertificateMutation.mutate({ studentId: certificateUserId, courseId: certificateCourseId });
                        }}
                      >
                        {issueCertificateMutation.isPending ? "Issuing..." : "Confirm Issue"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={certificatePreviewOpen} onOpenChange={setCertificatePreviewOpen}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Certificate Template</DialogTitle>
                      <DialogDescription>Preview</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const el = document.getElementById("certificate-print");
                          const w = window.open("", "_blank");
                          if (!w || !el) return;
                          const html = `
                            <html>
                              <head>
                                <title>Certificate</title>
                                <style>
                                  @page { size: A4; margin: 10mm; }
                                  html, body { margin: 0; padding: 0; }
                                  body { font-family: 'Stencil Std', Impact, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; }
                                  #certificate-print { width: 190mm; height: 270mm; margin: 0 auto; overflow: hidden; }
                                  img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                </style>
                              </head>
                              <body>${el.outerHTML}</body>
                            </html>
                          `;
                          w.document.open();
                          w.document.write(html);
                          w.document.close();
                          w.focus();
                          setTimeout(() => {
                            w.print();
                            w.close();
                          }, 100);
                        }}
                      >
                        Download PDF
                      </Button>
                    </div>
                    {(() => {
                      const user = (users || []).find((u) => u.id === certificateUserId);
                      const course = (courses || []).find((c) => c.id === certificateCourseId);
                      const code = generateCertificateCode(course?.title);
                      const today = (() => {
                        const d = new Date();
                        const dd = String(d.getDate()).padStart(2, "0");
                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                        const yyyy = d.getFullYear();
                        return `${dd}/${mm}/${yyyy}`;
                      })();
                      return (
                        <div
                          id="certificate-print"
                          className="relative"
                          style={{ fontFamily: "'Stencil Std', Impact, 'Segoe UI', system-ui, sans-serif" }}
                        >
                          <div className="p-[6px] rounded-3xl bg-gradient-to-r from-red-800 via-sky-400 to-blue-900">
                            <div className="relative bg-white rounded-2xl p-8 md:p-12 border-[6px] border-blue-900 shadow-[0_0_40px_rgba(0,0,0,0.35)] overflow-hidden">
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <img
                                  src={watermarkUrl}
                                  alt="Certificate Watermark"
                                  className="w-64 h-64 md:w-80 md:h-80 opacity-10"
                                />
                              </div>
                              <div className="relative z-10 flex flex-col items-center gap-2">
                                <img src={dicLogo} alt="College Logo" className="h-16 w-16 object-contain" />
                                <div className="flex items-center gap-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#DAA520" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.162L12 18.896l-7.336 3.964 1.402-8.162L.132 9.211l8.2-1.193z"/></svg>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#DAA520" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.162L12 18.896l-7.336 3.964 1.402-8.162L.132 9.211l8.2-1.193z"/></svg>
                                </div>
                                <div className="text-2xl md:text-3xl font-extrabold tracking-[0.25em] uppercase text-slate-900 text-center">
                                  Defence Intelligence College
                                </div>
                                <div className="text-sm text-muted-foreground tracking-[0.25em] uppercase">Karu, Abuja</div>
                              </div>
                              <div className="relative z-10 mt-8 text-center">
                                <div className="text-3xl md:text-4xl font-extrabold tracking-[0.3em] uppercase text-[#b38653]">
                                  Certificate of Completion
                                </div>
                                <div className="mt-4 text-sm text-[#b38653]">This is to certify that</div>
                                <div className="mt-2 text-2xl font-semibold text-[#b38653]">{user?.full_name || "Student"}</div>
                                <div className="mt-2 text-sm text-[#b38653]">has successfully completed</div>
                                <div className="mt-2 text-xl font-semibold text-[#b38653]">{course?.title || "Selected Course"}</div>
                                <div className="mt-1 text-xs italic text-[#b38653]">
                                  As part of DIC prerequisite  to traning program
                                </div>
                                <div className="mt-4 text-muted-foreground">Awarded on {today}</div>
                              </div>
                              <div className="relative z-10 mt-8 flex items-center justify-between">
                                <div className="text-sm">
                                  Code: <span className="font-mono">{code}</span>
                                </div>
                                <div className="text-sm font-semibold tracking-[0.2em] uppercase">Authorized by DIC</div>
                              </div>
                              <div className="relative z-10 mt-12 grid grid-cols-2 gap-8">
                                <div className="flex flex-col items-start">
                                  <div className="h-16 w-full max-w-[220px] flex items-center justify-start">
                                    {commandantSignatureUrl ? (
                                      <img src={commandantSignatureUrl} alt="Commandant Signature" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                      <div className="w-full h-px bg-slate-400" />
                                    )}
                                  </div>
                                  <div className="mt-2 text-lg font-bold">
                                    {(() => {
                                      const list = (leadership || []) as LeadershipRow[] | undefined;
                                      const pick =
                                        (list || []).find(l => {
                                          const pos = String(l.position || "").toLowerCase();
                                          return !!l.is_active && /commandant\s*dic/.test(pos);
                                        }) ||
                                        (list || []).find(l => {
                                          const pos = String(l.position || "").toLowerCase();
                                          return /commandant/.test(pos);
                                        });
                                      if (pick?.full_name) {
                                        return pick.rank ? `${pick.rank} ${pick.full_name}` : pick.full_name;
                                      }
                                      return "Commandant DIC";
                                    })()}
                                  </div>
                                  <div className="text-xs font-bold text-[#b38653]">Commandant DIC</div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="h-16 w-full max-w-[220px] flex items-center justify-end">
                                    {directorSignatureUrl ? (
                                      <img src={directorSignatureUrl} alt="Director Signature" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                      <div className="w-full h-px bg-slate-400" />
                                    )}
                                  </div>
                                  <div className="mt-2 text-lg font-bold text-right">
                                    {(() => {
                                      const list = (leadership || []) as LeadershipRow[] | undefined;
                                      const target = (list || []).find(l => String(l.full_name || "").toLowerCase().includes("keneth iheasirim"));
                                      if (target?.full_name) {
                                        return target.rank ? `${target.rank} ${target.full_name}` : target.full_name;
                                      }
                                      return "Dir Keneth Iheasirim";
                                    })()}
                                  </div>
                                  <div className="text-xs font-bold text-[#b38653] text-right">Dir of Strategic Studies</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </DialogContent>
                </Dialog>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Issued</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCertificates.map((cert: CertificateRow) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.profiles?.full_name}</TableCell>
                          <TableCell>{cert.courses?.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cert.certificate_code}</Badge>
                          </TableCell>
                          <TableCell>{new Date(cert.issued_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokeCertificateMutation.mutate({ studentId: cert.student_id, courseId: cert.course_id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
