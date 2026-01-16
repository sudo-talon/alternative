import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import dicVideo from "@/assets/dic.mp4";
import { useLanguage } from "@/contexts/LanguageContext";

export const AboutVideoSidebar = () => {
  const { t } = useLanguage();

  return (
    <Card className="shadow-elevated overflow-hidden w-full max-w-full">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 p-4">
        <CardTitle className="text-primary-foreground text-base sm:text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          {t('aboutUs') || 'About Us'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="rounded-lg overflow-hidden">
          <video 
            controls 
            playsInline 
            preload="metadata" 
            className="w-full aspect-video rounded-lg"
            poster="/images/dic-logo.png"
          >
            <source src={dicVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Learn more about Defence Intelligence College
        </p>
      </CardContent>
    </Card>
  );
};
