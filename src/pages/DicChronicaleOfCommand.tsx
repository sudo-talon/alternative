import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";
import effahImg from "@/assets/images.jpeg";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dicBg from "@/assets/dic-bg.png";

const DicChronicaleOfCommand = () => {
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const overrides: Record<string, string> = {
    [normalize("UM Bugaje")]: cdreBugaje,
    [normalize("Cdre UM BUGAJE")]: cdreBugaje,
    [normalize("Rear Admiral P. E. Effah")]: effahImg,
    [normalize("Patrick Effah")]: effahImg,
  };
  const [selectedLeader, setSelectedLeader] = useState<LeadershipRow | null>(null);
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
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dicBg})` }}>
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
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
              {leadership?.map((leader) => {
                const photo = overrides[normalize(leader.full_name)] || leader.photo_url || "";
                return (
                  <div key={leader.id} className="rounded-lg border bg-card text-card-foreground overflow-hidden">
                    <div className="relative aspect-square bg-muted group">
                      <img
                        src={photo}
                        alt={leader.full_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedLeader(leader)}>Preview Résumé</Button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-center font-semibold">{leader.rank} {leader.full_name}</div>
                      <div className="flex justify-center">
                        {leader.is_active ? (
                          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Current</Button>
                        ) : (
                          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Former</Button>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground text-center">Commandant DIC</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />

      <Dialog open={!!selectedLeader} onOpenChange={() => setSelectedLeader(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLeader?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLeader?.photo_url && (
              <img src={selectedLeader.photo_url} alt={selectedLeader.full_name || ""} className="w-full h-64 object-cover rounded" />
            )}
            <div className="text-sm text-muted-foreground">{selectedLeader?.rank} • {selectedLeader?.position}</div>
            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{selectedLeader?.bio}</div>
          </div>
        </DialogContent>
      </Dialog>

      
    </div>
  );
};

export default DicChronicaleOfCommand;