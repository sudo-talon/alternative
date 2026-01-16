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
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : magazines && magazines.length > 0 ? (
            <div className="space-y-4">
              {magazines.map((magazine) => (
                <div 
                  key={magazine.id}
                  className="group cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-2"
                  onClick={() => setSelectedMagazine(magazine)}
                >
                  {/* Large Cover Preview */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg mb-3 bg-muted">
                    {magazine.cover_image_url ? (
                      <img 
                        src={magazine.cover_image_url}
                        alt={magazine.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                        <BookOpen className="h-12 w-12 text-primary/50" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Read Now</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {magazine.title}
                    </h4>
                    {magazine.issue && (
                      <p className="text-xs text-muted-foreground">{magazine.issue}</p>
                    )}
                    <span className="text-xs text-primary inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Read now →
                    </span>
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