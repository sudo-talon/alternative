import { useNavigate } from "react-router-dom";
import dicLogo from "@/assets/dic-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary-dark text-primary-foreground py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={dicLogo} alt="DIC Logo" className="h-12 w-12" />
              <h3 className="font-bold text-lg">Defence Intelligence College</h3>
            </div>
            <p className="text-sm opacity-90">Karu, Abuja, Nigeria</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-accent transition-colors">{t('about')}</a></li>
              <li><a href="/courses" className="hover:text-accent transition-colors">{t('courses')}</a></li>
              <li><a href="/news" className="hover:text-accent transition-colors">{t('news')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">{t('contact')}</h3>
            <p className="text-sm opacity-90">Karu, Federal Capital Territory, Nigeria</p>
            <p className="text-sm opacity-90">{t('phone')}: +234 (0) 123 456 7890</p>
            <p className="text-sm opacity-90">{t('email')}: info@dic.gov.ng</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm opacity-75">
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
