import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, BookOpen, Cog, Users, GraduationCap } from "lucide-react";
import dicBg from "@/assets/dic-bg.png";
import dicGroupPhoto from "@/assets/dic-group-photo.webp";
import classroomHero from "@/assets/classroom-hero.jpg";
import departmentsHero from "@/assets/departments-hero.webp";
import dicLogo from "@/assets/dic-logo.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

const About = () => {
  type PersonnelRow = Database["public"]["Tables"]["personnel"]["Row"];
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const [selectedPerson, setSelectedPerson] = useState<PersonnelRow | null>(null);
  const { data: personnel } = useQuery<PersonnelRow[]>({
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
  const { data: leadership } = useQuery<LeadershipRow[]>({
    queryKey: ["about-leadership"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leadership")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as LeadershipRow[]) || [];
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const heads = (personnel || []).filter(p => {
    const dep = String(p.department || "").toLowerCase();
    const pos = String(p.position || "").toLowerCase();
    return dep === "leadership" || /head|hod|director|chief|commandant|coordinator/.test(pos);
  });
  const sourceList = heads;
  const firstPreferred = sourceList.find(p => /bugaje/i.test(String(p.full_name || "")));
  const secondPreferred = sourceList.find(p => /borgu/i.test(String(p.full_name || "")));
  const orderedTopTwo: PersonnelRow[] = [];
  if (firstPreferred) orderedTopTwo.push(firstPreferred);
  if (secondPreferred && secondPreferred !== firstPreferred) orderedTopTwo.push(secondPreferred);
  if (orderedTopTwo.length < 2) {
    for (const p of sourceList) {
      if (!orderedTopTwo.includes(p)) {
        orderedTopTwo.push(p);
        if (orderedTopTwo.length >= 2) break;
      }
    }
  }
  const topTwo = orderedTopTwo;
  const restHeads = sourceList.filter(p => !orderedTopTwo.includes(p));
  const secondRowList = [...restHeads];
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dicBg})` }}>
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              About Defence Intelligence College
            </h1>
            <p className="text-xl text-primary-foreground/90">
              A citadel of intelligence and security training in Nigeria
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-8">
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  About Us
                </h2>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    The Defence Intelligence College (DIC) hitherto known as the Defence Intelligence School (DIS) was established in 2001. At inception it was located at a temporary site within the Headquarters of the Defence Intelligence Agency (DIA) in Bonny Camp Lagos. However, due to the need for a large space and conducive environment, the school was relocated to its present location in Karu a suburb of Federal Capital Territory Abuja in October 2005. The objective of the relocation was to reposition the school with a focus on capacity building in support of DIA and the Armed Forces of Nigeria (AFN) through the provision of real-time defence intelligence to enhance national security.
                  </p>
                  <div>
                    <Carousel opts={{ align: "start", loop: true }}>
                      <CarouselContent>
                        {[
                          { src: "/gallery-pics/SY AUDU.jpg", caption: "SY Audu" },
                          { src: "/gallery-pics/library.jpg", caption: "Library" },
                          { src: "/gallery-pics/gym.jpg", caption: "Gym" },
                          { src: "/gallery-pics/court.jpg", caption: "Court" },
                          { src: "/gallery-pics/bar.jpg", caption: "Bar" },
                          { src: "/gallery-pics/AUDITORIUM.jpg", caption: "Auditorium" },
                          { src: "/gallery-pics/admin-block4.jpg", caption: "Admin Block 4" },
                          { src: "/gallery-pics/admin-bloc.jpg", caption: "Admin Bloc" },
                        ].map((item, idx) => (
                          <CarouselItem key={idx} className="basis-full">
                            <div className="rounded-lg border overflow-hidden">
                              <img src={item.src} alt={item.caption} className="w-full h-64 object-cover" />
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {item.caption}
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-6" />
                      <CarouselNext className="-right-6" />
                    </Carousel>
                    <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                      The nomenclature of the school was subsequently changed to Defence Intelligence College in March 2013 thereby encapsulating the vision of the Agency which is to make the College a citadel of intelligence and security training in Nigeria. The college has trained personnel drawn from DIA, Nigeria Armed Forces, Paramilitary Organisations and Staff of Ministries Department and Agencies. It also pertinent to state that the College has trained allied officers from Niger, Chad, Benin Republic and Ghana.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card className="shadow-elevated">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-7 w-7 text-primary" />
                  <h2 className="text-3xl font-bold">College Leadership</h2>
                </div>
                  
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {topTwo.map((p, idx) => (
                  <div key={p.id} className="rounded-lg border bg-card text-card-foreground overflow-hidden animate-in fade-in-50 slide-in-from-bottom-6" style={{ animationDelay: `${idx * 120}ms` }}>
                    <div className="relative aspect-square bg-muted group">
                      <img src={p.photo_url || ""} alt={p.full_name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedPerson(p)}>Preview Résumé</Button>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-center font-semibold">{p.rank ? `${p.rank} ${p.full_name}` : p.full_name}</div>
                      <div className="text-sm text-muted-foreground text-center">{p.position}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 relative">
                <Carousel opts={{ align: "start", loop: false }}>
                  <CarouselContent>
                    {secondRowList.map((p, index) => (
                      <CarouselItem key={p.id} className="basis-[25%]">
                        <div className="rounded-lg border bg-card text-card-foreground overflow-hidden animate-in fade-in-50 slide-in-from-bottom-6" style={{ animationDelay: `${index * 80}ms` }}>
                          <div className="relative aspect-square bg-muted group">
                            <img src={p.photo_url || ""} alt={p.full_name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm" onClick={() => setSelectedPerson(p)}>Preview Résumé</Button>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="text-center font-semibold">{p.rank ? `${p.rank} ${p.full_name}` : p.full_name}</div>
                            <div className="text-sm text-muted-foreground text-center">{p.position}</div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-6" />
                  <CarouselNext className="-right-6" />
                </Carousel>
              </div>
            </CardContent>
          </Card>

          </div>

          {/* Vision and Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Statement */}
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target className="h-7 w-7 text-primary" />
                  Vision Statement
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To produce well trained, patriotic and highly motivated manpower working with cutting edge technology under an effective leadership in collaboration with friendly forces that will provide comprehensive and timely defence intelligence in support of national security strategy.
                </p>
              </CardContent>
            </Card>

            {/* Mission Statement */}
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-7 w-7 text-primary" />
                  Mission Statement
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide security and intelligence training for all categories of DIA staff, personnel of the Nigerian Armed Forces and other security agencies, in order to enable them perform optimally wherever they may be deployed.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="p-8">
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
                <CarouselPrevious className="-left-6" />
                <CarouselNext className="-right-6" />
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
              <img src={selectedPerson.photo_url} alt={selectedPerson.full_name || ""} className="w-full h-64 object-cover rounded" />
            )}
            <div className="text-sm text-muted-foreground">{selectedPerson?.position} • {selectedPerson?.department}</div>
            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{selectedPerson?.bio}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default About;
