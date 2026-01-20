import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, BookOpen, Cog, Users, GraduationCap } from "lucide-react";
import dicBg from "@/assets/dic-bg.png";
import dicGroupPhoto from "@/assets/dic-group-photo.webp";
import departmentsHero from "@/assets/departments-hero.webp";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

const About = () => {
  type PersonnelRow = Database["public"]["Tables"]["personnel"]["Row"];
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const [selectedPerson, setSelectedPerson] = useState<PersonnelRow | LeadershipRow | null>(null);

  const { data: personnel, isLoading: personnelLoading } = useQuery<PersonnelRow[]>({
    queryKey: ["about-personnel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personnel")
        .select("*")
        .order("department", { ascending: true });
      if (error) throw error;
      return (data as PersonnelRow[]) || [];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: personnelSettings } = useQuery<Map<string, string>>({
    queryKey: ["about-personnel-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("title, message")
        .eq("type", "setting")
        .ilike("title", "personnel:%");
      if (error) throw error;
      const map = new Map<string, string>();
      (data || []).forEach((row: { title: string; message: string }) => map.set(row.title, row.message));
      return map;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });
  const readIsFaculty = (p: PersonnelRow): boolean => {
    const fallback = personnelSettings?.get(`personnel:is_faculty:${p.id}`);
    if (typeof (p as unknown as { is_faculty?: boolean }).is_faculty === "boolean") return !!(p as unknown as { is_faculty?: boolean }).is_faculty;
    if (typeof fallback === "string") return /true|1|yes/i.test(fallback);
    return false;
  };
  const readDisplayOrder = (p: PersonnelRow): number => {
    const raw = personnelSettings?.get(`personnel:display_order:${p.id}`);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };
  const settingsLoading = personnelLoading || !personnelSettings;
  const leadershipOrdered = (() => {
    const filtered = (personnel || []).filter(p => readIsFaculty(p));
    const list = filtered.slice().sort((a, b) => readDisplayOrder(a) - readDisplayOrder(b));
    const remaining = [...list];
    const prioritized: PersonnelRow[] = [];
    const pullByMatch = (matcher: (pos: string) => boolean) => {
      const index = remaining.findIndex(l => matcher(String(l.position || "").toLowerCase()));
      if (index !== -1) {
        prioritized.push(remaining[index]);
        remaining.splice(index, 1);
      }
    };
    pullByMatch(pos => /commandant\s*dic/.test(pos) || /^commandant(\s|$)/.test(pos));
    pullByMatch(pos => /deputy\s+commandant/.test(pos));
    pullByMatch(pos => /(dir(ector)?\s+of\s+strategic\s+studies|director\s+strategic\s+studies)/.test(pos));
    return [...(prioritized as unknown as LeadershipRow[]), ...(remaining as unknown as LeadershipRow[])];
  })();
  const topThree = leadershipOrdered.slice(0, 3);
  const secondRowList = leadershipOrdered.slice(3);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative text-primary-foreground py-12 md:py-20 overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dicBg})` }}>
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="w-full px-4 relative z-10">
          <div className="max-w-screen-xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
              About Defence Intelligence College
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              A citadel of intelligence and security training in Nigeria
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full px-2 sm:px-4 py-12 md:py-16">
        <div className="max-w-screen-xl mx-auto space-y-8 md:space-y-12">
          <div className="space-y-8">
            <Card className="shadow-elevated">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  About Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-[15px] sm:text-base md:text-lg max-w-prose md:max-w-3xl w-full sm:w-auto hyphens-auto break-words">
                      The Defence Intelligence College (DIC), hitherto known as the Defence Intelligence School (DIS), was established in 2001. At inception it was located at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp, Lagos. However, due to the need for a large space and conducive environment, the school was relocated to its present location in Karu, a suburb of the Federal Capital Territory Abuja, in October 2005.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-[15px] sm:text-base md:text-lg max-w-prose md:max-w-3xl w-full sm:w-auto hyphens-auto break-words">
                      The objective of the relocation was to reposition the school with a focus on capacity building in support of DIA and the Armed Forces of Nigeria (AFN) through the provision of real-time defence intelligence to enhance national security.
                      The nomenclature of the school was subsequently changed to Defence Intelligence College in March 2013, thereby encapsulating the vision of the Agency which is to make the College a citadel of intelligence and security training in Nigeria.
                    </p>
                  </div>
                  <div>
                    <Carousel opts={{ align: "start", loop: true }}>
                      <CarouselContent>
                        {[
                          { src: "/gallery-pics/SY AUDU.jpg", caption: "SY Audu Hall" },
                          { src: "/gallery-pics/library.jpg", caption: "College Library" },
                          { src: "/gallery-pics/gym.jpg", caption: "College Gym" },
                          { src: "/gallery-pics/court.jpg", caption: "Basketball Court" },
                          { src: "/gallery-pics/bar.jpg", caption: "ROTUNDA Bar" },
                          { src: "/gallery-pics/AUDITORIUM.jpg", caption: "Auditorium" },
                          { src: "/gallery-pics/admin-block4.jpg", caption: "College Administrative Block" },
                          { src: "/gallery-pics/admin-bloc.jpg", caption: "College Administrative Block" },
                        ].map((item, idx) => (
                          <CarouselItem key={idx} className="basis-full">
                            <div className="rounded-lg border overflow-hidden">
                              <img src={item.src} alt={item.caption} className="w-full h-48 md:h-64 object-cover" loading="lazy" decoding="async" />
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {item.caption}
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex -left-3 md:-left-6" />
                      <CarouselNext className="hidden sm:flex -right-3 md:-right-6" />
                    </Carousel>
                    <p className="mt-4 text-muted-foreground leading-relaxed text-base md:text-lg break-words">
                      The College has trained personnel drawn from DIA, the Nigerian Armed Forces, Paramilitary Organisations, and staff of Ministries, Departments, and Agencies. It is also pertinent to state that the College has trained allied officers from Niger, Chad, Benin Republic, and Ghana.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-elevated">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-7 w-7 text-primary" />
                    <h2 className="text-3xl font-bold">College Leadership</h2>
                  </div>
                </div>
                {settingsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading leadership...</div>
                ) : leadershipOrdered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No leadership profiles available.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {topThree.map((leader, idx) => {
                        const photo = leader.photo_url || "";
                        const rank = leader.rank;
                        const position = leader.position;
                        return (
                          <div key={leader.id} className="rounded-lg border bg-card text-card-foreground overflow-hidden animate-in fade-in-50 slide-in-from-bottom-6" style={{ animationDelay: `${idx * 120}ms` }}>
                            <div className="relative aspect-square bg-muted group">
                              <img src={photo} alt={leader.full_name || ""} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedPerson(leader)}
                                >
                                  Preview Résumé
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="text-center font-semibold">{rank ? `${rank} ${leader.full_name}` : leader.full_name}</div>
                              <div className="text-sm text-muted-foreground text-center">{position}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {secondRowList.length > 0 && (
                      <div className="mt-6 relative">
                        <Carousel opts={{ align: "start", loop: false }}>
                          <CarouselContent>
                            {secondRowList.map((leader, index) => {
                              const photo = leader.photo_url || "";
                              const rank = leader.rank;
                              const position = leader.position;
                              return (
                                <CarouselItem key={leader.id} className="basis-[70%] sm:basis-[50%] md:basis-[33.33%] lg:basis-[25%]">
                                  <div className="rounded-lg border bg-card text-card-foreground overflow-hidden animate-in fade-in-50 slide-in-from-bottom-6" style={{ animationDelay: `${index * 80}ms` }}>
                                    <div className="relative aspect-square bg-muted group">
                                      <img src={photo} alt={leader.full_name || ""} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => setSelectedPerson(leader)}
                                        >
                                          Preview Résumé
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                      <div className="text-center font-semibold">{rank ? `${rank} ${leader.full_name}` : leader.full_name}</div>
                                      <div className="text-sm text-muted-foreground text-center">{position}</div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:hidden mt-2 min-h-[44px]"
                                        onClick={() => setSelectedPerson(leader)}
                                      >
                                        Preview Résumé
                                      </Button>
                                    </div>
                                  </div>
                                </CarouselItem>
                              );
                            })}
                          </CarouselContent>
                          <CarouselPrevious className="-left-6" />
                          <CarouselNext className="-right-6" />
                        </Carousel>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="shadow-elevated">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Target className="h-7 w-7 text-primary" />
                    Vision Statement
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    To be a world-class centre in intelligence and security education, fostersing collaboration and innovation for global stability
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elevated">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="h-7 w-7 text-primary" />
                    Mission Statement
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    Building capacity for intelligence and security excellence among national and international professionals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {[
                    { year: "2001", title: "Establishment", description: "Founded as Defence Intelligence School (DIS) at Bonny Camp Lagos.", icon: Cog },
                    { year: "2005", title: "Relocation to Karu", description: "Moved to permanent location in Karu, Abuja for expanded facilities and conducive learning environment.", icon: Users },
                    { year: "2013", title: "Renamed to DIC", description: "Officially renamed to Defence Intelligence College, marking our evolution as a premier intelligence training institution.", icon: Shield },
                    { year: "2025", title: "Regional Excellence", description: "Training personnel from Nigeria and allied nations including Niger, Chad, Benin Republic, and Ghana.", icon: GraduationCap },
                  ].map((m, index) => {
                    const IconComp = m.icon;
                    return (
                      <CarouselItem key={index} className="basis-[80%] sm:basis-[60%] md:basis-[50%] lg:basis-[33.33%]">
                        <div className="border rounded-lg p-6 animate-in fade-in-50 slide-in-from-bottom-6" style={{ animationDelay: `${index * 120}ms` }}>
                          <div className="flex items-center gap-3 mb-3">
                            <IconComp className="h-7 w-7 text-primary" />
                            <div className="text-primary font-bold">{m.year}</div>
                          </div>
                          <div className="text-lg font-semibold mb-2">{m.title}</div>
                          <p className="text-muted-foreground leading-relaxed text-sm">{m.description}</p>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-3 md:-left-6" />
                <CarouselNext className="hidden sm:flex -right-3 md:-right-6" />
              </Carousel>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
      <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPerson ? (selectedPerson.rank ? `${selectedPerson.rank} ${selectedPerson.full_name}` : selectedPerson.full_name) : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPerson?.photo_url && (
              <div className="w-full h-64 bg-muted rounded flex items-center justify-center overflow-hidden">
                <img src={selectedPerson.photo_url} alt={selectedPerson.full_name || ""} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <div className="text-sm text-muted-foreground">{selectedPerson?.position}</div>
            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{selectedPerson?.bio}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default About;
