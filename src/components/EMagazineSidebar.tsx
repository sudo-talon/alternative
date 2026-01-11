import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MagazineViewer } from "@/components/MagazineViewer";
import { BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Magazine = {
  id: string;
  title: string;
  issue: string | null;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string;
  published_at: string;
};

export const EMagazineSidebar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);

  const { data: magazines, isLoading } = useQuery<Magazine[]>({
    queryKey: ["magazines-sidebar"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("magazines")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Magazine[];
    },
  });

  return (
    <>
      <Card className="shadow-elevated overflow-hidden w-full max-w-full">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 p-4">
          <CardTitle className="text-primary-foreground text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('eMagazine') || 'E-Magazine'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-20 shrink-0 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : magazines && magazines.length > 0 ? (
            <div className="space-y-3">
              {magazines.map((magazine) => (
                <div 
                  key={magazine.id}
                  className="flex gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedMagazine(magazine)}
                >
                  {magazine.cover_image_url ? (
                    <img 
                      src={magazine.cover_image_url}
                      alt={magazine.title}
                      className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-18 sm:w-16 sm:h-20 bg-muted rounded shrink-0 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm line-clamp-2 leading-tight">
                      {magazine.title}
                    </h4>
                    {magazine.issue && (
                      <p className="text-xs text-muted-foreground mt-1">{magazine.issue}</p>
                    )}
                    <span className="text-xs text-primary mt-1 inline-block">Read now →</span>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2 gap-2 text-sm"
                onClick={() => navigate("/e-magazine")}
              >
                View All Magazines
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No magazines available</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => navigate("/e-magazine")}
              >
                Go to E-Magazine
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Magazine Viewer Modal */}
      {selectedMagazine && (
        <MagazineViewer 
          magazine={selectedMagazine}
          isOpen={!!selectedMagazine}
          onClose={() => setSelectedMagazine(null)}
        />
      )}
    </>
  );
};