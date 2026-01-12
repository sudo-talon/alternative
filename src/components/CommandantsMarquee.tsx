import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";
import effahImg from "@/assets/images.jpeg";

interface Commandant {
  id: string;
  full_name: string;
  rank: string;
  position: string;
  bio: string;
  photo_url?: string;
  is_active: boolean;
}

export const CommandantsMarquee = () => {
  const [selectedCommandant, setSelectedCommandant] = useState<Commandant | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  const { data: commandants = [], isLoading, error } = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => {
      try {
        const { data, error } = await supabaseClient
          .from("leadership")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) {
          console.error("Leadership fetch error:", error);
          throw error;
        }
        return (data as Commandant[]) || [];
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message.toLowerCase() : "";
        if (msg.includes("abort") || msg.includes("err_aborted") || msg.includes("failed to fetch")) {
          console.error("Network error fetching leadership:", e);
          return [];
        }
        throw e;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });
  const overrides = useMemo<Record<string, string>>(() => ({
    "CDRE A. U. Bugaje": cdreBugaje,
    "Effah": effahImg,
  }), []);
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      const c = commandants[currentIndex];
      if (!c) { setResolvedPhotoUrl(null); return; }
      const altLocal = c.full_name.toLowerCase().includes("bugaje") ? cdreBugaje : undefined;
      const raw = overrides[c.full_name] || altLocal || c.photo_url || null;
      if (!raw) { setResolvedPhotoUrl(null); return; }
      if (raw.startsWith("http") || raw.includes("/storage/v1/object/public/") || raw.startsWith("/") || raw.includes("assets/")) {
        setResolvedPhotoUrl(raw);
        return;
      }
      const parts = raw.split("/");
      const bucket = parts[0];
      const path = parts.slice(1).join("/");
      try {
        const { data } = await supabaseClient.storage.from(bucket).createSignedUrl(path, 300);
        setResolvedPhotoUrl(data?.signedUrl || raw);
      } catch {
        setResolvedPhotoUrl(raw);
      }
    };
    run();
  }, [currentIndex, commandants, overrides]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : commandants.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < commandants.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="gradient-subtle py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">{t('pastPresentCommandants')}</h2>
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !commandants.length) {
    return (
      <div className="gradient-subtle py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">{t('pastPresentCommandants')}</h2>
        <div className="text-center text-muted-foreground">
          {error ? "Unable to load commandants" : "No commandants available"}
        </div>
      </div>
    );
  }

  const currentCommandant = commandants[currentIndex];
  const formatPosition = (p?: string) => {
    const s = (p || "").toLowerCase();
    if (s.includes("former commandant")) return "Former Commandant DIC";
    return p || "";
  };
  

  return (
    <>
      <div className="gradient-subtle py-8 sm:py-12 w-full max-w-full overflow-hidden">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-left mb-4 sm:mb-6 md:mb-8 px-4">{t('pastPresentCommandants')}</h2>
        <div className="relative px-2 sm:px-4 w-full max-w-full">
          <div className="relative">
            <Card className="shadow-elevated w-full max-w-full mx-auto">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="shrink-0 flex justify-center">
                    {(() => {
                      const src = resolvedPhotoUrl || overrides[currentCommandant.full_name] || currentCommandant.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop";
                      return (
                        <img
                          src={src}
                          alt={currentCommandant.full_name}
                          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-primary shadow-lg"
                        />
                      );
                    })()}
                  </div>
                  <div className="flex flex-col items-center text-center w-full space-y-2">
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-primary leading-tight">{`${currentCommandant.rank} ${currentCommandant.full_name}`}</h3>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-full">
                      <span className={`text-sm sm:text-base font-semibold ${currentCommandant.is_active ? 'text-red-500' : 'text-accent'}`}>
                        {currentCommandant.is_active ? t('commandantDIC') : formatPosition(currentCommandant.position)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCommandant(currentCommandant)}
                        className="mt-2"
                      >
                        {t('readMore')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full z-10 bg-background/90 backdrop-blur-sm min-h-[36px] min-w-[36px]"
              aria-label="Previous commandant"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full z-10 bg-background/90 backdrop-blur-sm min-h-[36px] min-w-[36px]"
              aria-label="Next commandant"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1 mt-4 flex-wrap">
            {commandants.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-colors min-h-[32px]"
                aria-label={`Go to commandant ${index + 1}`}
              >
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCommandant} onOpenChange={() => setSelectedCommandant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCommandant ? `${selectedCommandant.rank} ${selectedCommandant.full_name}` : ""}</DialogTitle>
            <DialogDescription>
              {selectedCommandant?.rank} • {selectedCommandant?.is_active ? t('commandantDIC') : formatPosition(selectedCommandant?.position)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {(() => {
              const selectedPhoto = selectedCommandant && (resolvedPhotoUrl || overrides[selectedCommandant.full_name] || selectedCommandant.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop");
              return selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={selectedCommandant.full_name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-primary mx-auto mb-4 shadow-lg"
                />
              ) : null;
            })()}
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {selectedCommandant?.bio || t('noBioAvailable')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
