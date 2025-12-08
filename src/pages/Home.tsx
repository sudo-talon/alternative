import { Navbar } from "@/components/Navbar";
import { NewsFlash } from "@/components/NewsFlash";
import { CommandantsMarquee } from "@/components/CommandantsMarquee";
import { GovernmentBanner } from "@/components/GovernmentBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, BookOpen } from "lucide-react";
import dicBg from "@/assets/dic-bg.png";
import dicGroupPhoto from "@/assets/dic-group-photo.webp";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Home = () => {
  const navigate = useNavigate();
  const [activeYear, setActiveYear] = useState("2001");
  const { t } = useLanguage();

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('eliteTraining'),
      description: t('eliteTrainingDesc'),
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: t('professionalDevelopment'),
      description: t('professionalDevelopmentDesc'),
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('expertInstructors'),
      description: t('expertInstructorsDesc'),
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: t('comprehensiveCurriculum'),
      description: t('comprehensiveCurriculumDesc'),
    },
  ];

  const timelineData = [
    { year: "2001", title: t('established2001'), description: t('established2001Desc') },
    { year: "2012", title: t('campusRelocation'), description: t('campusRelocationDesc') },
    { year: "2015", title: t('curriculumExpansion'), description: t('curriculumExpansionDesc') },
    { year: "2023", title: t('modernEra'), description: t('modernEraDesc') }
  ];

  const activeTimeline = timelineData.find(item => item.year === activeYear);

  return (
    <div className="min-h-screen bg-background">
      <GovernmentBanner />
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            {t('welcomeTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground mb-8 max-w-2xl mx-auto">
            {t('welcomeSubtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate("/courses")}
            >
              {t('explorePrograms')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => navigate("/about")}
            >
              {t('learnMore')}
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
              <h2 className="text-3xl font-bold mb-8">{t('whyChooseDIC')}</h2>
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
              <h2 className="text-3xl font-bold mb-8">{t('aboutUs')}</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Image */}
                <div className="rounded-lg overflow-hidden shadow-elevated">
                  <img 
                    src={dicGroupPhoto} 
                    alt="DIC Students Learning" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                  {/* Timeline Dots */}
                  <div className="flex items-center gap-2">
                    {timelineData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <button
                          onClick={() => setActiveYear(item.year)}
                          className="flex flex-col items-center gap-2 transition-all hover:scale-110 focus:outline-none"
                        >
                          <div className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                            activeYear === item.year ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'
                          }`}></div>
                          <span className={`text-sm font-semibold transition-colors ${
                            activeYear === item.year ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {item.year}
                          </span>
                        </button>
                        {index < 3 && (
                          <div className="w-12 h-0.5 bg-muted mx-2"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="min-h-[200px]">
                    {activeTimeline && (
                      <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold mb-4">{activeTimeline.title}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {activeTimeline.description}
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={() => navigate("/about")} 
                      className="bg-primary hover:bg-primary-dark text-primary-foreground"
                    >
                      {t('readMore')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <NewsFlash />
              
              <Card className="mt-6 shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>{t('quickLinks')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/courses")}
                  >
                    {t('browseCourses')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/auth")}
                  >
                    {t('collegePortal')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open("https://elibrary.dic.gov.ng", "_blank")}
                  >
                    {t('eLibrary')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/contact")}
                  >
                    {t('contact')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
