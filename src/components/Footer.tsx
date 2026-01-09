import { useNavigate } from "react-router-dom";
import dicLogo from "@/assets/dic-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary-dark text-primary-foreground py-8 sm:py-10 md:py-12 mt-8 sm:mt-12 w-full max-w-[100vw]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Logo & Address */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3 sm:mb-4">
              <img src={dicLogo} alt="DIC Logo" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg">Defence Intelligence College</h3>
            </div>
            <p className="text-xs sm:text-sm opacity-90">Karu, Abuja, Nigeria</p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="/about" className="hover:text-accent transition-colors">{t('about')}</a></li>
              <li><a href="/courses" className="hover:text-accent transition-colors">{t('courses')}</a></li>
              <li><a href="/news" className="hover:text-accent transition-colors">{t('news')}</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{t('contact')}</h3>
            <div className="space-y-1 text-xs sm:text-sm opacity-90">
              <p>Karu, Federal Capital Territory, Nigeria</p>
              <p>{t('phone')}: +234 (0) 123 456 7890</p>
              <p>{t('email')}: info@dic.gov.ng</p>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
            © {new Date().getFullYear()} Defence Intelligence College Nigeria. {t('footerRights')} {t('designedBy').replace('Designed & Managed by Talongeeks', '')}
            <a 
              href="https://talongeeks.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              Designed & Managed by Talongeeks
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
