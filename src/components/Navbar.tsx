import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import dicLogo from "@/assets/dic-logo.png";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    { name: "Home", path: "/" },
    { name: "About DIC", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "News & Blog", path: "/news" },
    { name: "Contact Us", path: "/contact" },
  ];

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
            <Button 
              onClick={() => navigate("/auth")}
              className="ml-4 bg-accent hover:bg-accent/90"
            >
              Log In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-primary-foreground hover:bg-primary-foreground/10 justify-start">
                  {link.name}
                </Button>
              </Link>
            ))}
            <Button 
              onClick={() => {
                navigate("/auth");
                setIsOpen(false);
              }}
              className="w-full bg-accent hover:bg-accent/90"
            >
              Log In
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
