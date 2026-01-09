import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";

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
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const overrides: Record<string, string> = {
    [normalize("UM Bugaje")]: cdreBugaje,
    [normalize("Cdre UM BUGAJE")]: cdreBugaje,
    [normalize("U.M. Bugaje")]: cdreBugaje,
  };

  const { data: commandants = [], isLoading } = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leadership")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;
        return (data as Commandant[]) || [];
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message.toLowerCase() : "";
        if (msg.includes("abort") || msg.includes("err_aborted") || msg.includes("failed to fetch")) {
          return [];
        }
        throw e;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : commandants.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < commandants.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="gradient-subtle py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t('pastPresentCommandants')}</h2>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!commandants.length) {
    return null;
  }

  const currentCommandant = commandants[currentIndex];
  const formatPosition = (p?: string) => {
    const s = (p || "").toLowerCase();
    if (s.includes("former commandant")) return "Former Commandant DIC";
    return p || "";
  };

  return (
    <>
      <div className="gradient-subtle py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-left md:text-center mb-6 md:mb-8">{t('pastPresentCommandants')}</h2>
        <div className="relative px-4 sm:px-6 overflow-hidden max-w-[100vw]">
          <div className="relative">
            <Card className="shadow-elevated mx-0 sm:mx-0 lg:mx-0 w-full">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-center justify-center">
                  <div className="shrink-0 flex justify-center w-full sm:w-auto">
                    {(() => {
                      const overrideSrc = overrides[normalize(currentCommandant.full_name)];
                      const src = overrideSrc || currentCommandant.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop";
                      return (
                        <img
                          src={src}
                          alt={currentCommandant.full_name}
                          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-primary shadow-lg"
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left w-full">
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl text-primary break-words">{`${currentCommandant.rank} ${currentCommandant.full_name}`}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between w-full">
                      <span className={`text-sm font-semibold break-words max-w-full ${currentCommandant.is_active ? 'text-red-500 text-center' : 'text-accent'}`}>
                        {currentCommandant.is_active ? t('commandantDIC') : formatPosition(currentCommandant.position)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCommandant(currentCommandant)}
                        className="shrink-0 min-h-[44px] self-center mx-auto"
                      >
                        {t('readMore')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="block">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full z-10 bg-background/80 backdrop-blur-sm min-h-[44px] min-w-[44px]"
                aria-label="Previous commandant"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full z-10 bg-background/80 backdrop-blur-sm min-h-[44px] min-w-[44px]"
                aria-label="Next commandant"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {commandants.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors`}
                aria-label={`Go to commandant ${index + 1}`}
              >
                <div className={`w-2 h-2 rounded-full ${
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
              const overrideSrc = selectedCommandant ? overrides[normalize(selectedCommandant.full_name)] : undefined;
              const selectedPhoto = selectedCommandant && (overrideSrc || selectedCommandant.photo_url);
              return selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={selectedCommandant.full_name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-primary mx-auto mb-4 shadow-lg"
                />
              ) : null;
            })()}
            <p className="text-sm text-foreground leading-relaxed">{selectedCommandant?.bio}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
