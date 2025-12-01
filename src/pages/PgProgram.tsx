import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen } from "lucide-react";
import pgHeroImage from "@/assets/pg-program-hero.jpeg";

const PgProgram = () => {
  const { data: programs, isLoading } = useQuery({
    queryKey: ["pg-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pg_programs")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={pgHeroImage} 
            alt="Postgraduate Programs" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <GraduationCap className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Postgraduate Programmes
              </h1>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Faculty of Social Sciences UNN in Affiliation with DIC
            </p>
            <Badge variant="secondary" className="text-lg py-2 px-6">
              Admission Ongoing - Apply Now
            </Badge>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {programs?.map((program) => (
                  <Card key={program.id} className="border-2 shadow-elevated hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">
                            {program.department}
                          </h2>
                          <Badge variant="outline" className="mb-4">
                            {program.degree_types}
                          </Badge>
                        </div>
                      </div>

                      {program.specializations && program.specializations.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg mb-3 text-primary">
                            Specializations:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {program.specializations.map((spec: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-primary">
                          Entry Requirements:
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {program.requirements}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Apply Now Section */}
            <Card className="mt-12 border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
                <p className="text-muted-foreground mb-6">
                  Join the Defence Intelligence College Postgraduate Programme
                </p>
                <a 
                  href="https://dicnigeria.com.ng/apply" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
                >
                  Apply Now
                </a>
              </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>In partnership with University of Nigeria, Nsukka (UNN)</p>
              <a 
                href="https://www.unn.edu.ng/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.unn.edu.ng
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PgProgram;
