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

  const { data: commandants = [], isLoading } = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leadership")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Commandant[];
    },
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

  return (
    <>
      <div className="gradient-subtle py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t('pastPresentCommandants')}</h2>
        <div className="relative max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="shrink-0"
              aria-label="Previous commandant"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Card className="flex-1 shadow-elevated">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="shrink-0">
                    <img
                      src={currentCommandant.photo_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop"}
                      alt={currentCommandant.full_name}
                      className="w-36 h-36 rounded-full object-cover border-4 border-primary shadow-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <h3 className="font-bold text-xl text-primary">{currentCommandant.full_name}</h3>
                      <p className="text-base text-muted-foreground">{currentCommandant.rank}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                      <span className="text-sm font-semibold text-accent">
                        {currentCommandant.is_active ? t('commandantDIC') : currentCommandant.position}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCommandant(currentCommandant)}
                      >
                        {t('readMore')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="shrink-0"
              aria-label="Next commandant"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {commandants.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
                aria-label={`Go to commandant ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCommandant} onOpenChange={() => setSelectedCommandant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCommandant?.full_name}</DialogTitle>
            <DialogDescription>
              {selectedCommandant?.rank} • {selectedCommandant?.is_active ? t('commandantDIC') : selectedCommandant?.position}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedCommandant?.photo_url && (
              <img
                src={selectedCommandant.photo_url}
                alt={selectedCommandant.full_name}
                className="w-40 h-40 rounded-full object-cover border-4 border-primary mx-auto mb-4 shadow-lg"
              />
            )}
            <p className="text-sm text-foreground leading-relaxed">{selectedCommandant?.bio}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
