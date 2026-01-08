import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Video, Image as ImageIcon, Users } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";
import dicBg from "@/assets/dic-bg.png";
import type { Database } from "@/integrations/supabase/types";

const News = () => {
  const navigate = useNavigate();
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const overrides: Record<string, string> = {
    "Cdre UM BUGAJE": cdreBugaje,
  };
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [resumeOpen, setResumeOpen] = useState(false);
  const assetImages = Object.values(import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp}', { as: 'url', eager: true })) as string[];
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(assetImages.length / imagesPerPage));
  const currentImages = assetImages.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage);
  const imageCaptions = assetImages.map((url, i) => `Campus Photo ${i + 1}`);
  const aiPictures: string[] = [
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20campus%20aerial%20view",
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20training%20classroom",
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20military%20intelligence%20crest",
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20auditorium",
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20students%20in%20uniform",
    "https://image.pollinations.ai/prompt/Defence%20Intelligence%20College%20Nigeria%20training%20lab",
  ];
  const youtubeLinks = [
    "https://www.youtube.com/watch?v=U-HZvLTXAEQ",
    "https://www.youtube.com/watch?v=abGY1dEix1g",
    "https://www.youtube.com/watch?v=mmfNQK9wi94",
  ];
  const extractYouTubeId = (url: string) => {
    try {
      const m = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
      return m ? m[1] : "";
    } catch {
      return "";
    }
  };
  const youtubeVideos = youtubeLinks.map((url) => {
    const id = extractYouTubeId(url);
    return {
      title: "DIC Video",
      id,
      poster: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "",
      embed: id ? `https://www.youtube.com/embed/${id}` : url,
    };
  });

  type NewsItem = {
    id: string;
    title: string;
    content: string;
    published_at: string;
    created_at: string;
    featured_image_url?: string | null;
  };

  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const { data: activeCommandant } = useQuery({
    queryKey: ["current-commandant"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("leadership")
          .select("*")
          .eq("is_active", true)
          .limit(1);
        if (error) throw error;
        return data && data.length ? data[0] : null;
      } catch (e) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });

  const { data: commandants } = useQuery<LeadershipRow[]>({
    queryKey: ["commandants-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leadership")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as LeadershipRow[]).filter((l) => /commandant/i.test(String(l.position || "")));
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });
  const [showAllPictures, setShowAllPictures] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dicBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
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
                        <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                          <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onclick="this.parentElement.parentElement.remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          ${item.featured_image_url ? `<img src="${item.featured_image_url}" alt="${item.title}" class="w-full h-auto rounded mb-4" loading="lazy" decoding="async" />` : ''}
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
                    {index === 0 && item.featured_image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img src={item.featured_image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                    )}
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
              {activeCommandant && (
                <Card className="shadow-elevated">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-2">
                      Commandants Portrait
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full group">
                        <img
                          src={overrides[activeCommandant.full_name] || activeCommandant.photo_url || cdreBugaje}
                          alt={activeCommandant.full_name}
                          className="w-full h-auto object-contain shadow-elevated"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="sm" onClick={() => setResumeOpen(true)}>Preview Résumé</Button>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">{activeCommandant.full_name}</div>
                        <div className="text-sm text-muted-foreground">{activeCommandant.rank}</div>
                      </div>
                      <button
                        onClick={() => navigate("/chronicle-of-command")}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        View Chronicle of Command
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{activeCommandant?.full_name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {activeCommandant?.photo_url && (
                      <img src={activeCommandant.photo_url} alt={activeCommandant.full_name || ""} className="w-full h-64 object-cover rounded" />
                    )}
                    <div className="text-sm text-muted-foreground">{activeCommandant?.rank} • {activeCommandant?.position}</div>
                    <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{activeCommandant?.bio}</div>
                  </div>
                </DialogContent>
              </Dialog>
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
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={youtubeVideos[selectedVideo].embed}
                        title={youtubeVideos[selectedVideo].title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {youtubeVideos.map((v, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVideo(i)}
                          className={`rounded overflow-hidden border ${selectedVideo === i ? "border-primary" : "border-transparent"}`}
                          title={v.title}
                        >
                          <img src={v.poster} alt={v.title} className="aspect-video w-full object-cover" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
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
                    {assetImages.slice(0, Math.min(3, assetImages.length)).map((url, idx) => (
                      <button
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        onClick={() => {
                          setGalleryOpen(true);
                          setCurrentPage(Math.floor(idx / imagesPerPage) + 1);
                        }}
                        title={imageCaptions[idx]}
                      >
                        <img src={url} alt={imageCaptions[idx]} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </button>
                    ))}
                    {assetImages.length >= 4 && (
                      assetImages.length > 4 ? (
                        <button
                          key="plus"
                          className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted/60 transition-colors"
                          onClick={() => setGalleryOpen(true)}
                          title={`Show ${assetImages.length - 4} more images`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                          <span className="text-sm font-semibold">+{assetImages.length - 4}</span>
                        </button>
                      ) : (
                        <button
                          key={3}
                          className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => {
                            setGalleryOpen(true);
                            setCurrentPage(Math.floor(3 / imagesPerPage) + 1);
                          }}
                          title={imageCaptions[3]}
                        >
                          <img src={assetImages[3]} alt={imageCaptions[3]} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </button>
                      )
                    )}
                  </div>
                  <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Picture Gallery</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentImages.map((url, i) => {
                          const globalIndex = (currentPage - 1) * imagesPerPage + i;
                          return (
                            <div key={i} className="space-y-2">
                              <div className="aspect-square rounded-lg overflow-hidden">
                                <img src={url} alt={imageCaptions[globalIndex]} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </div>
                              <div className="text-xs text-muted-foreground">{imageCaptions[globalIndex]}</div>
                            </div>
                          );
                        })}
                      </div>
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }} />
                          </PaginationItem>
                          {Array.from({ length: totalPages }).map((_, pageIdx) => (
                            <PaginationItem key={pageIdx}>
                              <PaginationLink href="#" isActive={currentPage === pageIdx + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(pageIdx + 1); }}>
                                {pageIdx + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }} />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </DialogContent>
                  </Dialog>
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
