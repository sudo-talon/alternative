import { Navbar } from "@/components/Navbar";
import { NewsFlash } from "@/components/NewsFlash";
import { CommandantsMarquee } from "@/components/CommandantsMarquee";
import { GovernmentBanner } from "@/components/GovernmentBanner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import dicBg from "@/assets/dic-bg.png";
import dicVideo from "@/assets/dic.mp4";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageWrapper } from "@/components/PageWrapper";


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

  const timelineData = useMemo(() => ([
    { year: "2001", title: t('established2001'), description: t('established2001Desc') },
    { year: "2012", title: t('campusRelocation'), description: t('campusRelocationDesc') },
    { year: "2015", title: t('curriculumExpansion'), description: t('curriculumExpansionDesc') },
    { year: "2023", title: t('modernEra'), description: t('modernEraDesc') },
    { year: "2025", title: "Regional Excellence", description: "Expanding collaboration with allied nations and modernizing training across the region." },
  ]), [t]);

  const activeTimeline = useMemo(
    () => timelineData.find(item => item.year === activeYear),
    [timelineData, activeYear]
  );
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const scrollToIndex = useCallback((idx: number) => {
    const container = timelineRef.current;
    if (!container) return;
    const items = container.querySelectorAll(".timeline-item");
    const el = items[idx] as HTMLElement | undefined;
    if (el) {
      container.scrollTo({ left: el.offsetLeft - 32, behavior: "smooth" });
    }
  }, []);

  const goToIndex = useCallback((idx: number) => {
    const next = Math.max(0, Math.min(idx, timelineData.length - 1));
    setActiveYear(timelineData[next].year);
    scrollToIndex(next);
  }, [timelineData, scrollToIndex]);

  const handlePrev = useCallback(() => {
    const idx = timelineData.findIndex(t => t.year === activeYear);
    const prev = (idx - 1 + timelineData.length) % timelineData.length;
    goToIndex(prev);
  }, [activeYear, timelineData, goToIndex]);

  const handleNext = useCallback(() => {
    const idx = timelineData.findIndex(t => t.year === activeYear);
    const next = (idx + 1) % timelineData.length;
    goToIndex(next);
  }, [activeYear, timelineData, goToIndex]);

  useEffect(() => {
    const id = setInterval(() => {
      const idx = timelineData.findIndex(t => t.year === activeYear);
      const next = (idx + 1) % timelineData.length;
      goToIndex(next);
    }, 5000);
    return () => clearInterval(id);
  }, [activeYear, timelineData, goToIndex]);

  return (
    <div className="min-h-screen bg-background max-w-[100vw] overflow-x-hidden">
      <GovernmentBanner />
      <Navbar />
      
      <section className="relative min-h-[320px] sm:min-h-[480px] md:min-h-[600px] flex items-center justify-center overflow-hidden px-4 py-12 sm:py-16 max-w-[100vw]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dicBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 sm:mb-6 px-4 break-words">
            {t('welcomeTitle')}
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-primary-foreground mb-8 max-w-2xl mx-auto px-4">
            {t('welcomeSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto min-h-[44px]"
              onClick={() => navigate("/courses")}
            >
              {t('explorePrograms')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto min-h-[44px]"
              onClick={() => navigate("/about")}
            >
              {t('learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <PageWrapper>
      <section className="py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">
            {/* Features Grid */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">{t('whyChooseDIC')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {features.map((feature, index) => (
                  <Card key={index} className="shadow-elevated hover:shadow-xl transition-shadow w-full">
                    <CardHeader>
                      <div className="flex items-center gap-4 justify-start flex-wrap">
                        <div className="p-3 bg-gradient-accent rounded-lg text-primary-foreground shrink-0">
                          {feature.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-semibold break-words">{feature.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-left break-words whitespace-normal leading-relaxed">{feature.description}</p>
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
            <div className="pt-8 sm:pt-10 max-w-[100vw] overflow-x-hidden">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">{t('aboutUs')}</h2>
              <div>
                <div className="mb-6">
                  <video controls playsInline preload="metadata" className="w-full rounded-lg shadow-elevated">
                    <source src={dicVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="space-y-6">
                  {/* Timeline Dots */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Previous year"
                      onClick={handlePrev}
                      className="absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 sm:h-11 sm:w-11 min-h-[36px] min-w-[36px]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div
                      ref={timelineRef}
                      className="overflow-x-auto px-2 py-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
                    >
                      <div className="flex items-center gap-2 min-w-max">
                        {timelineData.map((item, index) => (
                          <div key={index} className="timeline-item flex items-center flex-none snap-center">
                            <button
                              onClick={() => goToIndex(index)}
                              className="flex flex-col items-center gap-2 transition-all hover:scale-110 focus:outline-none flex-none min-w-[44px] min-h-[44px] justify-center"
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
                            {index < timelineData.length - 1 && (
                              <div className="w-12 sm:w-16 h-0.5 bg-muted mx-2 flex-none"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Next year"
                      onClick={handleNext}
                      className="absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 sm:h-11 sm:w-11 min-h-[36px] min-w-[36px]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="min-h-[200px] text-left">
                    {activeTimeline && (
                      <div className="animate-fade-in">
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{activeTimeline.title}</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                          {activeTimeline.description}
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={() => navigate("/about")} 
                      className="bg-primary hover:bg-primary-dark text-primary-foreground ml-1 sm:ml-0"
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
            <div className="md:sticky md:top-24">
              <NewsFlash />
              
              <Card className="mt-6 shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>{t('quickLinks')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px]"
                    onClick={() => navigate("/courses")}
                  >
                    {t('browseCourses')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px]"
                    onClick={() => navigate("/auth")}
                  >
                    {t('collegePortal')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px]"
                    onClick={() => window.open("https://elibrary.dic.gov.ng", "_blank")}
                  >
                    {t('eLibrary')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start min-h-[44px]"
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
      </PageWrapper>

      <Footer />
    </div>
  );
};

export default Home;
