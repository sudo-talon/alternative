import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GovernmentBanner } from "@/components/GovernmentBanner";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MagazineViewer } from "@/components/MagazineViewer";
import { MagazineUploadDialog } from "@/components/MagazineUploadDialog";
import { BookOpen, Calendar, FileText, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabaseClient as supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

type Magazine = {
  id: string;
  title: string;
  issue: string | null;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  published_at: string;
  created_at: string;
};

const EMagazine = () => {
  const { t } = useLanguage();
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdmin();
  }, []);

  const { data: magazines, isLoading, error, refetch } = useQuery<Magazine[]>({
    queryKey: ["magazines"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("magazines")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as Magazine[];
    },
  });

  return (
    <div className="min-h-screen bg-background w-full max-w-[100vw] overflow-x-hidden">
      <GovernmentBanner />
      <Navbar />
      
      <PageWrapper className="py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              {t('eMagazine') || 'E-Magazine'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('eMagazineDesc') || 'Browse and read our digital publications'}
            </p>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Magazine
            </Button>
          )}
        </div>

        {/* Magazine Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load magazines</p>
          </div>
        ) : magazines && magazines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {magazines.map((magazine) => (
              <Card 
                key={magazine.id} 
                className="group overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 bg-card border-border"
                onClick={() => setSelectedMagazine(magazine)}
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                  {magazine.cover_image_url ? (
                    <img 
                      src={magazine.cover_image_url} 
                      alt={magazine.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                      <FileText className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Read Now
                    </Button>
                  </div>
                </div>
                
                {/* Info */}
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 leading-tight">
                    {magazine.title}
                  </h3>
                  {magazine.issue && (
                    <p className="text-xs text-muted-foreground">{magazine.issue}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(magazine.published_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No magazines available</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Digital magazines will appear here once they are published.
            </p>
          </div>
        )}
      </PageWrapper>

      {/* Magazine Viewer Modal */}
      {selectedMagazine && (
        <MagazineViewer 
          magazine={selectedMagazine}
          isOpen={!!selectedMagazine}
          onClose={() => setSelectedMagazine(null)}
        />
      )}

      {/* Upload Dialog (Admin only) */}
      {isAdmin && (
        <MagazineUploadDialog 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            refetch();
            setIsUploadOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default EMagazine;
