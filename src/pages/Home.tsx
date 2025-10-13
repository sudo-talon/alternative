import { Navbar } from "@/components/Navbar";
import { NewsFlash } from "@/components/NewsFlash";
import { CommandantsMarquee } from "@/components/CommandantsMarquee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, BookOpen } from "lucide-react";
import dicBg from "@/assets/dic-bg.png";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Elite Training",
      description: "World-class intelligence and security training programs",
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Professional Development",
      description: "Continuous learning for defense professionals",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Instructors",
      description: "Learn from experienced intelligence professionals",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Comprehensive Curriculum",
      description: "Cutting-edge courses in intelligence and security",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dicBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Welcome to<br />Defence Intelligence College Nigeria
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground mb-8 max-w-2xl mx-auto">
            Empowering security professionals with world-class intelligence training to safeguard Nigeria and beyond.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate("/courses")}
            >
              Explore our programmes
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Features Grid */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Why Choose DIC?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="shadow-elevated hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-accent rounded-lg text-primary-foreground">
                          {feature.icon}
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Commandants Section */}
            <div>
              <CommandantsMarquee />
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-3xl font-bold mb-8">About Us</h2>
              <div className="relative bg-gradient-subtle rounded-lg p-8">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30"></div>
                
                <div className="space-y-12">
                  {[
                    {
                      year: "2001",
                      title: "Established as DIS",
                      description: "The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001. At inception it was located at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos."
                    },
                    {
                      year: "2012",
                      title: "Campus Relocation",
                      description: "The college relocated to a permanent site in Victoria Island, expanding its facilities to accommodate more students and programs."
                    },
                    {
                      year: "2015",
                      title: "Curriculum Expansion",
                      description: "Major curriculum overhaul introducing new specialized courses in cyber intelligence and digital forensics."
                    },
                    {
                      year: "2023",
                      title: "Modern Era",
                      description: "Partner with Talongeeks to achieve full digitalization of learning systems and international accreditation for all programs."
                    }
                  ].map((milestone, index) => (
                    <div key={index} className="relative pl-20 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg z-10"></div>
                      
                      {/* Year badge */}
                      <div className="absolute left-0 top-0 text-2xl font-bold text-primary">
                        {milestone.year}
                      </div>
                      
                      {/* Content */}
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-3">{milestone.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={() => navigate("/about")} className="hover-scale">
                  Read more about our history
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <NewsFlash />
              
              <Card className="mt-6 shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/courses")}
                  >
                    Browse Courses
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/auth")}
                  >
                    Student Portal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/contact")}
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="/about" className="hover:text-accent">About DIC</a></li>
                <li><a href="/courses" className="hover:text-accent">Courses</a></li>
                <li><a href="/news" className="hover:text-accent">News</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-sm opacity-90">Email: info@dicnigeria.edu.ng</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-75">
            © {new Date().getFullYear()} Defence Intelligence College Nigeria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
