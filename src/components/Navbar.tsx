import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import dicLogo from "@/assets/dic-logo.png";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MagazineFlipbook } from "./MagazineFlipbook";
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: t('home'), path: "/" },
    { name: t('about'), path: "/about" },
    { name: t('departments'), path: "/departments" },
    { name: t('courses'), path: "/courses" },
    { name: t('pgProgram'), path: "/pg-program" },
    { name: t('news'), path: "/news" },
    { name: t('contact'), path: "/contact" },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (_err) {
      // swallow aborted sign-out network errors to avoid noisy logs
    } finally {
      navigate("/");
    }
  };

  return (
    <nav className="bg-gradient-hero shadow-elevated sticky top-0 z-50 w-full max-w-[100vw]">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-[70%] sm:max-w-none">
            <img src={dicLogo} alt="DIC Logo" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0" />
            <div className="text-primary-foreground min-w-0">
              <div className="font-bold text-xs sm:text-sm md:text-lg leading-tight truncate">Defence Intelligence College</div>
              <div className="text-[10px] sm:text-xs opacity-90 truncate">Karu, Abuja</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 text-sm px-3">
                  {link.name}
                </Button>
              </Link>
            ))}
            {/* College Magazine Button - Desktop */}
            <MagazineFlipbook 
              pdfUrl="/magazine/dic-magazine.pdf" 
              title="DIC College Magazine"
              variant="desktop"
            />
            {user && <NotificationBell />}
            <LanguageSwitcher />
            {user ? (
              <Button 
                onClick={handleLogout}
                className="ml-2 bg-accent hover:bg-accent/90 min-h-[40px]"
              >
                {t('logout')}
              </Button>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="ml-2 bg-accent hover:bg-accent/90 min-h-[40px]"
              >
                {t('login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
            aria-controls="mobile-nav"
            aria-expanded={isOpen ? "true" : "false"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            id="mobile-nav" 
            className="lg:hidden absolute top-16 sm:top-20 left-0 right-0 w-full bg-gradient-hero shadow-lg border-t border-primary-foreground/10 pb-4 px-4 space-y-2 animate-accordion-down max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-foreground/10 justify-start h-12 text-base">
                  {link.name}
                </Button>
              </Link>
            ))}
            {/* College Magazine Flipbook */}
            <MagazineFlipbook 
              pdfUrl="/magazine/dic-magazine.pdf" 
              title="DIC College Magazine"
              variant="mobile"
            />
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            {user ? (
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full bg-accent hover:bg-accent/90 h-12 text-base"
              >
                {t('logout')}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  navigate("/auth");
                  setIsOpen(false);
                }}
                className="w-full bg-accent hover:bg-accent/90 h-12 text-base"
              >
                {t('login')}
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
