import { useState } from "react";
import { ChevronDown, ChevronUp, Building2, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const GovernmentBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="bg-muted border-b border-border w-full max-w-[100vw]">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[40px] sm:min-h-[44px]"
        >
          <span className="text-center leading-tight">{t('govBannerText')}</span>
          <span className="flex items-center gap-1 text-primary font-medium whitespace-nowrap">
            Here's how you know
            {isExpanded ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
          </span>
        </button>
        
        {isExpanded && (
          <div className="pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
            <div className="flex gap-3">
              <div className="p-2 bg-primary rounded-full h-fit shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">Official websites use .gov.ng</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A <strong>.gov.ng</strong> website belongs to an official government organization in Nigeria.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-green-600 rounded-full h-fit shrink-0">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">Secure websites use HTTPS</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A <strong>lock</strong> or <strong>https://</strong> means you've safely connected to the website.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
