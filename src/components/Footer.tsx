import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-primary-dark text-primary-foreground py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Defence Intelligence College</h3>
            <p className="text-sm opacity-90">Karu, Abuja, Nigeria</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-accent transition-colors">About DIC</a></li>
              <li><a href="/courses" className="hover:text-accent transition-colors">Courses</a></li>
              <li><a href="/news" className="hover:text-accent transition-colors">News</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="text-sm opacity-90">Email: info@dicnigeria.edu.ng</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm opacity-75">
            © {new Date().getFullYear()} Defence Intelligence College Nigeria. All rights reserved. Designed & Managed by{" "}
            <a 
              href="https://talongeeks.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              Talongeeks
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
