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
              <h2 className="text-3xl font-bold mb-6">About Us</h2>
              <div className="overflow-hidden gradient-subtle py-8 rounded-lg">
                <div className="relative">
                  <div className="flex animate-marquee-horizontal gap-6 px-4">
                    {[
                      {
                        year: "2001",
                        title: "Established as DIS",
                        description: "The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001 at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos."
                      },
                      {
                        year: "2012",
                        title: "Expansion & Growth",
                        description: "DIS expanded its curriculum and training facilities, introducing advanced intelligence methodologies and modernizing its infrastructure to meet evolving security challenges."
                      },
                      {
                        year: "2015",
                        title: "Upgraded to College",
                        description: "The institution was upgraded from Defence Intelligence School to Defence Intelligence College, reflecting its enhanced academic status and broader mandate in intelligence education."
                      },
                      {
                        year: "2023",
                        title: "Modern Era",
                        description: "DIC continues to evolve as a premier institution for intelligence training, incorporating cutting-edge technology and international best practices in its programs."
                      },
                      {
                        year: "2001",
                        title: "Established as DIS",
                        description: "The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001 at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos."
                      },
                      {
                        year: "2012",
                        title: "Expansion & Growth",
                        description: "DIS expanded its curriculum and training facilities, introducing advanced intelligence methodologies and modernizing its infrastructure to meet evolving security challenges."
                      },
                      {
                        year: "2015",
                        title: "Upgraded to College",
                        description: "The institution was upgraded from Defence Intelligence School to Defence Intelligence College, reflecting its enhanced academic status and broader mandate in intelligence education."
                      },
                      {
                        year: "2023",
                        title: "Modern Era",
                        description: "DIC continues to evolve as a premier institution for intelligence training, incorporating cutting-edge technology and international best practices in its programs."
                      }
                    ].map((milestone, index) => (
                      <Card key={index} className="min-w-[320px] shrink-0 shadow-elevated">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl font-bold text-primary">{milestone.year}</div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg mb-2">{milestone.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => navigate("/about")}>Read more about our history</Button>
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
