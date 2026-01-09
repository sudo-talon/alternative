import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shield, Laptop, GraduationCap, Users, Languages } from "lucide-react";
import departmentsHero from "@/assets/departments-hero.webp";
import dicBg from "@/assets/dic-bg.png";

const Departments = () => {
  const departments = [
    {
      id: "professional",
      name: "Professional Studies",
      icon: <Shield className="w-6 h-6" />,
      description: "The Department of Professional Studies is a premier institution for the study of intelligence and strategic security. Our department is designed to provide students with a comprehensive understanding of the principles and practices of intelligence and strategic security, as well as the technical skills needed to succeed in this field. Our faculty is comprised of experienced professionals from the intelligence and security communities, who provide students with a unique perspective on the challenges and opportunities in this field."
    },
    {
      id: "counter-intelligence",
      name: "Counter Intelligence",
      icon: <Shield className="w-6 h-6" />,
      description: "The Department of Counter Intelligence focuses on protecting national security through advanced counterintelligence operations and strategic analysis. Students learn sophisticated techniques for identifying, preventing, and neutralizing threats to national security interests."
    },
    {
      id: "technical",
      name: "Technical Studies",
      icon: <Laptop className="w-6 h-6" />,
      description: "The Department of Technical Studies provides cutting-edge training in technical intelligence gathering, cyber security, and advanced analytical tools. Our curriculum covers modern technological applications in intelligence operations and security analysis."
    },
    {
      id: "general",
      name: "General Studies",
      icon: <GraduationCap className="w-6 h-6" />,
      description: "The Department of General Studies offers foundational courses that support intelligence education, including critical thinking, research methodology, ethics, and interdisciplinary studies essential for well-rounded intelligence professionals."
    },
    {
      id: "jmap",
      name: "Joint Military Attaché Programme",
      icon: <Users className="w-6 h-6" />,
      description: "The Joint Military Attaché Programme prepares military personnel for diplomatic and intelligence roles in international settings. This specialized program combines military expertise with diplomatic skills and international relations knowledge."
    },
    {
      id: "languages",
      name: "Language Studies",
      icon: <Languages className="w-6 h-6" />,
      description: "The Department of Language Studies provides comprehensive language training crucial for intelligence operations. Students develop proficiency in multiple languages and cultural understanding essential for international intelligence work."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-12 md:py-20 overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dicBg})` }}>
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">Our Departments</h1>
            <p className="text-lg sm:text-xl opacity-90">
              The College has six departments, each specializing in critical areas of intelligence and strategic security education.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="professional" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-muted/50 p-2">
              {departments.map((dept) => (
                <TabsTrigger 
                  key={dept.id} 
                  value={dept.id}
                  className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full min-h-[44px]"
                >
                  {dept.icon}
                  <span className="text-xs text-center line-clamp-2">{dept.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {departments.map((dept) => (
              <TabsContent key={dept.id} value={dept.id} className="mt-8">
                <Card className="border-2 shadow-elevated">
                  <CardContent className="p-4 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      <div className="w-full">
                        <img 
                          src={departmentsHero} 
                          alt={`Department of ${dept.name}`}
                          className="w-full h-auto rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                          <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit">
                            {dept.icon}
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-bold break-words">Department of {dept.name}</h2>
                        </div>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                          {dept.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Departments;
