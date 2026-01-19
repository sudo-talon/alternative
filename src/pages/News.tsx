import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient as supabase } from "@/lib/supabase";
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
  const [newsPage, setNewsPage] = useState(1);
  const newsPageSize = 10;
  const { data: newsCount } = useQuery<number>({
    queryKey: ["news-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
  const totalNewsPages = Math.max(1, Math.ceil((newsCount || 0) / newsPageSize));
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["news-page", newsPage],
    queryFn: async () => {
      const from = (newsPage - 1) * newsPageSize;
      const to = from + newsPageSize - 1;
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return (data as NewsItem[]) || [];
    },
  });
  type GalleryPictureRow = Database["public"]["Tables"]["gallery_pictures"]["Row"];
  const [eventPage, setEventPage] = useState(1);
  const eventPageSize = 6;
  const { data: eventsCount } = useQuery<number>({
    queryKey: ["events-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("gallery_pictures")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
  const totalEventPages = Math.max(1, Math.ceil((eventsCount || 0) / eventPageSize));
  const { data: eventPictures } = useQuery<GalleryPictureRow[]>({
    queryKey: ["gallery-pictures-page", eventPage],
    queryFn: async () => {
      const from = (eventPage - 1) * eventPageSize;
      const to = from + eventPageSize - 1;
      const { data, error } = await supabase
        .from("gallery_pictures")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return (data as GalleryPictureRow[]) || [];
    },
  });

  const { data: activeCommandant } = useQuery({
    queryKey: ["current-commandant"],
    queryFn: async () => {
      try {
        const excludedNames = new Set([
          "Dir Keneth Iheasirim",
          "Lt Coll John Doe 3",
          "Lt Commander John Doe 2",
          "Dir John Doe 1",
          "SDIO John Doe 4",
        ]);
        const { data, error } = await supabase
          .from("leadership")
          .select("*")
          .eq("is_active", true)
          .ilike("position", "%commandant%")
          .ilike("position", "%dic%")
          .order("display_order", { ascending: true })
          .limit(5);
        if (error) throw error;
        const list = (data || []).filter((l: LeadershipRow) => !excludedNames.has(String(l.full_name)));
        return list.length ? list[0] : null;
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
      <section className="relative py-12 md:py-20 overflow-hidden min-h-[300px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dicBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 md:mb-6">
              News & Blog
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90">
              Stay updated with the latest from Defence Intelligence College
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <>
                {/* Featured + Right List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className="md:col-span-2 relative rounded-lg overflow-hidden shadow-elevated cursor-pointer"
                    onClick={() => {
                      if (newsItems && newsItems[0]) navigate(`/news/${newsItems[0].id}`);
                    }}
                  >
                    {newsItems[0]?.featured_image_url ? (
                      <img src={newsItems[0].featured_image_url || ""} alt={newsItems[0].title} className="w-full h-full object-cover aspect-video" />
                    ) : (
                      <div className="aspect-video bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-white text-xs mb-1">Featured Story</div>
                      <div className="text-white text-2xl sm:text-3xl font-bold">{newsItems[0]?.title}</div>
                      <div className="text-white/80 text-xs sm:text-sm mt-1">{newsItems[0] ? formatDistanceToNow(new Date(newsItems[0].published_at), { addSuffix: true }) : ""}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[newsItems[1], newsItems[2], newsItems[3], newsItems[4]].filter(Boolean).map((item) => (
                      <button
                        key={item!.id}
                        className="flex items-start gap-3 border-b pb-4 last:border-b-0 w-full text-left hover:bg-muted/40 rounded"
                        onClick={() => navigate(`/news/${item!.id}`)}
                      >
                        {item!.featured_image_url ? (
                          <img src={item!.featured_image_url || ""} alt={item!.title} className="h-16 w-24 object-cover rounded" />
                        ) : (
                          <div className="h-16 w-24 bg-muted rounded" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold line-clamp-2">{item!.title}</div>
                          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item!.published_at), { addSuffix: true })}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Top Stories row */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Top Stories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {newsItems.slice(5, 10).map((item) => (
                      <button
                        key={item.id}
                        className="rounded-lg overflow-hidden shadow-elevated border text-left hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/news/${item.id}`)}
                      >
                        {item.featured_image_url ? (
                          <img src={item.featured_image_url} alt={item.title} className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-muted" />
                        )}
                        <div className="p-3">
                          <div className="text-sm font-semibold line-clamp-2">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewsPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalNewsPages }).map((_, pageIdx) => (
                      <PaginationItem key={pageIdx}>
                        <PaginationLink
                          href="#"
                          isActive={newsPage === pageIdx + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setNewsPage(pageIdx + 1);
                          }}
                        >
                          {pageIdx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewsPage((p) => Math.min(totalNewsPages, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                {/* Events Gallery */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">Events Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(eventPictures || []).map((p) => (
                      <div key={p.id} className="relative rounded-lg overflow-hidden shadow-elevated border group">
                        <img src={p.image_url} alt={p.title || "Event"} className="w-full h-full object-cover aspect-square" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-white text-sm">{p.title || "Event"}</div>
                        </div>
                      </div>
                    ))}
                    {(eventPictures || []).length === 0 && (
                      <>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden shadow-elevated border">
                            <div className="w-full h-full aspect-square bg-muted" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setEventPage((p) => Math.max(1, p - 1));
                          }}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalEventPages }).map((_, pageIdx) => (
                        <PaginationItem key={pageIdx}>
                          <PaginationLink
                            href="#"
                            isActive={eventPage === pageIdx + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              setEventPage(pageIdx + 1);
                            }}
                          >
                            {pageIdx + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setEventPage((p) => Math.min(totalEventPages, p + 1));
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
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
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                          <Button variant="secondary" size="sm" onClick={() => setResumeOpen(true)}>Preview Résumé</Button>
                        </div>
                      </div>
                      <div className="text-center w-full">
                        <div className="font-bold text-lg">{activeCommandant.full_name}</div>
                        <div className="text-sm text-muted-foreground mb-2">{activeCommandant.rank}</div>
                        <Button variant="outline" size="sm" className="w-full sm:hidden min-h-[44px]" onClick={() => setResumeOpen(true)}>
                          Preview Résumé
                        </Button>
                      </div>
                      <button
                        onClick={() => navigate("/chronicle-of-command")}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground min-h-[44px]"
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
                          <img src={v.poster} alt={v.title} className="aspect-video w-full object-cover" />
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
                        <img src={url} alt={imageCaptions[idx]} className="w-full h-full object-cover" />
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
                          <img src={assetImages[3]} alt={imageCaptions[3]} className="w-full h-full object-cover" />
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
                                <img src={url} alt={imageCaptions[globalIndex]} className="w-full h-full object-cover" />
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
