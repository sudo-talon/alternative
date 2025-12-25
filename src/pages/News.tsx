import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Video, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import dicLogo from "@/assets/dic-logo.png";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";
import type { Database } from "@/integrations/supabase/types";

const News = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .order("published_at", { ascending: false });
        if (error) throw error;
        return data || [];
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

  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const { data: commandantPortrait } = useQuery<LeadershipRow | null>({
    queryKey: ["commandant-portrait"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leadership")
          .select("*")
          .order("display_order", { ascending: true });
        if (error) throw error;
        const rows = (data as LeadershipRow[]) || [];
        return rows.find((d) => d.is_active) ?? rows[0] ?? null;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message.toLowerCase() : "";
        if (msg.includes("abort") || msg.includes("err_aborted") || msg.includes("failed to fetch")) {
          return null;
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
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              News & Blog
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Stay updated with the latest from Defence Intelligence College
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* News Articles - Main Column */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              Latest News
            </h2>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-elevated">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : newsItems && newsItems.length > 0 ? (
              <div className="space-y-6">
                {newsItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="shadow-elevated hover:shadow-xl transition-all cursor-pointer opacity-0 animate-fly-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => {
                      // Create a modal or navigate to detail view
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                      modal.innerHTML = `
                        <div class="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                          <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onclick="this.parentElement.parentElement.remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          <h2 class="text-3xl font-bold mb-4">${item.title}</h2>
                          <p class="text-sm text-muted-foreground mb-6">${formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</p>
                          <p class="text-muted-foreground leading-relaxed whitespace-pre-wrap">${item.content}</p>
                        </div>
                      `;
                      modal.onclick = (e) => {
                        if (e.target === modal) modal.remove();
                      };
                      document.body.appendChild(modal);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {item.content}
                      </p>
                      <p className="text-primary font-semibold mt-4">Click to read more →</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-elevated">
                <CardContent className="p-12 text-center">
                  <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No news available at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gallery Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center justify-between">
                    <span>Commandant Portrait</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={commandantPortrait?.photo_url || cdreBugaje || dicLogo}
                      alt={commandantPortrait?.full_name || "Commandant Portrait"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {commandantPortrait?.full_name || "Defence Intelligence College"}
                    </div>
                    {commandantPortrait?.position && (
                      <div className="text-sm text-muted-foreground">{commandantPortrait.position}</div>
                    )}
                  </div>
                  <Link to="/dic-chronicale-of-command">
                    <Button className="w-full bg-accent hover:bg-accent/90">
                      View Chronicale of Command
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Video Gallery */}
              <Card className="shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Video content coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Picture Gallery */}
              <Card className="shadow-elevated">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Picture Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="aspect-square bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Gallery coming soon
                  </p>
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

export default News;
