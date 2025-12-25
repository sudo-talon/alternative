import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

const DicChronicaleOfCommand = () => {
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const overrides: Record<string, string> = {
    "Rear Admiral P. E. Effah": "/assets/cdre-effah.jpeg",
  };
  const { data: leadership } = useQuery<LeadershipRow[]>({
    queryKey: ["chronicale-leadership"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leadership")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;
        return (data as LeadershipRow[]) || [];
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message.toLowerCase() : "";
        if (msg.includes("abort") || msg.includes("err_aborted") || msg.includes("failed to fetch")) {
          return [];
        }
        throw e;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 600000,
    gcTime: 900000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              DIC – Chronicale of Command
            </h1>
            <p className="text-xl text-primary-foreground/90">
              A historical view of command leadership at Defence Intelligence College
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Command Leadership Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {leadership?.map((leader) => (
                <div key={leader.id} className="rounded-lg border bg-card text-card-foreground overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img
                      src={leader.photo_url || overrides[leader.full_name]}
                      alt={leader.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{leader.full_name}</div>
                      {leader.is_active && <Badge className="bg-accent text-accent-foreground">Current</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{leader.rank}</div>
                    <div className="text-sm text-muted-foreground">{leader.position}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default DicChronicaleOfCommand;