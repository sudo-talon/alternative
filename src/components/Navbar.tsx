import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import dicLogo from "@/assets/dic-logo.png";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <nav className="bg-gradient-hero shadow-elevated sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img src={dicLogo} alt="DIC Logo" className="h-12 w-12" />
            <div className="text-primary-foreground">
              <div className="font-bold text-lg leading-tight">Defence Intelligence College</div>
              <div className="text-xs opacity-90">Karu, Abuja</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  {link.name}
                </Button>
              </Link>
            ))}
            {user && <NotificationBell />}
            <LanguageSwitcher />
            {user ? (
              <Button 
                onClick={handleLogout}
                className="ml-4 bg-accent hover:bg-accent/90"
              >
                {t('logout')}
              </Button>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="ml-4 bg-accent hover:bg-accent/90"
              >
                {t('login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground"
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
          <div id="mobile-nav" className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-foreground/10 justify-start">
                  {link.name}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {t('logout')}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  navigate("/auth");
                  setIsOpen(false);
                }}
                className="w-full bg-accent hover:bg-accent/90"
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
