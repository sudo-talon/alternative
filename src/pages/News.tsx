import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Newspaper, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import cdreBugaje from "@/assets/cdre-bugaje.jpeg";
import dicBg from "@/assets/dic-bg.png";
import type { Database } from "@/integrations/supabase/types";
import { EMagazineSidebar } from "@/components/EMagazineSidebar";

const News = () => {
  const navigate = useNavigate();
  type LeadershipRow = Database["public"]["Tables"]["leadership"]["Row"];
  const overrides: Record<string, string> = {
    "Cdre UM BUGAJE": cdreBugaje,
  };
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
  type GalleryPictureRow = { id: string; title: string; image_url: string; description: string | null; created_at: string };
  const [eventPage, setEventPage] = useState(1);
  const eventPageSize = 6;
  const [lightboxImage, setLightboxImage] = useState<GalleryPictureRow | null>(null);
  const [filterText, setFilterText] = useState("");
  
  // Fetch gallery pictures from database
  const { data: allGalleryPictures = [] } = useQuery({
    queryKey: ["gallery-pictures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_pictures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GalleryPictureRow[];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
  
  // Filter pictures based on search
  const filteredPictures = allGalleryPictures.filter((p) =>
    p.title.toLowerCase().includes(filterText.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(filterText.toLowerCase())
  );
  const eventsCount = filteredPictures.length;
  const totalEventPages = Math.max(1, Math.ceil(eventsCount / eventPageSize));
  const eventPictures = filteredPictures.slice((eventPage - 1) * eventPageSize, eventPage * eventPageSize);

  const { data: activeCommandant } = useQuery({
    queryKey: ["current-commandant"],
    queryFn: async () => {
      try {
        const excludedNames = new Set([
          "Dr. Example User",
          "John Doe",
          "Jane Doe"
        ]);
        const query = supabase
          .from("leadership")
          .select("*")
          .eq("is_active", true);

        const { data, error } = await query
          .ilike("position", "%commandant%")
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Featured Story - larger, takes 3 columns */}
                  <div
                    className="lg:col-span-3 relative rounded-lg overflow-hidden shadow-elevated cursor-pointer group"
                    onClick={() => {
                      if (newsItems && newsItems[0]) navigate(`/news/${newsItems[0].id}`);
                    }}
                  >
                    {newsItems[0]?.featured_image_url ? (
                      <img src={newsItems[0].featured_image_url || ""} alt={newsItems[0].title} className="w-full h-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="aspect-[4/3] bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-destructive text-destructive-foreground px-3 py-1 text-xs font-semibold rounded">Featured Story</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                        <span className="text-primary font-medium">News</span>
                        <span>•</span>
                        <span>DIC Media</span>
                        <span>•</span>
                        <span>{newsItems[0] ? new Date(newsItems[0].published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</span>
                      </div>
                      <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{newsItems[0]?.title}</h3>
                      <p className="text-white/70 text-sm mt-2 line-clamp-2">{newsItems[0]?.content?.substring(0, 150)}...</p>
                    </div>
                  </div>
                  
                  {/* Right sidebar list - 2 columns */}
                  <div className="lg:col-span-2 space-y-4">
                    {[newsItems[1], newsItems[2], newsItems[3], newsItems[4]].filter(Boolean).map((item) => (
                      <button
                        key={item!.id}
                        className="flex items-start gap-4 w-full text-left hover:bg-muted/50 rounded-lg p-2 transition-colors"
                        onClick={() => navigate(`/news/${item!.id}`)}
                      >
                        {item!.featured_image_url ? (
                          <img src={item!.featured_image_url || ""} alt={item!.title} className="h-20 w-28 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="h-20 w-28 bg-muted rounded-lg flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span>{new Date(item!.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span>5 min read</span>
                          </div>
                          <h4 className="text-sm font-semibold line-clamp-2 leading-snug">{item!.title}</h4>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Top Stories row */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-6 border-b pb-2">Top Stories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {newsItems.slice(5, 10).map((item) => (
                      <button
                        key={item.id}
                        className="rounded-lg overflow-hidden border bg-card text-left hover:shadow-lg transition-shadow group"
                        onClick={() => navigate(`/news/${item.id}`)}
                      >
                        <div className="relative">
                          {item.featured_image_url ? (
                            <img src={item.featured_image_url} alt={item.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full aspect-video bg-muted" />
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-semibold line-clamp-2 leading-snug">{item.title}</h4>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <span>DIC News</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
                          </div>
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
                {/* Picture Gallery with filtering and lightbox */}
                <div className="mt-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold">Picture Gallery</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter pictures..."
                        value={filterText}
                        onChange={(e) => {
                          setFilterText(e.target.value);
                          setEventPage(1);
                        }}
                        className="pl-9 pr-9"
                      />
                      {filterText && (
                        <button
                          onClick={() => {
                            setFilterText("");
                            setEventPage(1);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(eventPictures || []).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setLightboxImage(p)}
                        className="relative rounded-lg overflow-hidden shadow-elevated border group cursor-pointer text-left"
                      >
                        <img src={p.image_url} alt={p.title || "Picture"} className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="text-white text-sm font-medium">{p.title || "Picture"}</div>
                        </div>
                      </button>
                    ))}
                    {(eventPictures || []).length === 0 && allGalleryPictures.length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No pictures in gallery yet
                      </div>
                    )}
                    {(eventPictures || []).length === 0 && allGalleryPictures.length > 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No pictures match your filter
                      </div>
                    )}
                  </div>
                  {eventsCount > eventPageSize && (
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
                  )}
                </div>

                {/* Lightbox Dialog */}
                <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{lightboxImage?.title || "Picture"}</DialogTitle>
                    </DialogHeader>
                    {lightboxImage && (
                      <div className="relative">
                        <img
                          src={lightboxImage.image_url}
                          alt={lightboxImage.title || "Picture"}
                          className="w-full max-h-[80vh] object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h3 className="text-white font-bold text-lg">{lightboxImage.title}</h3>
                          {lightboxImage.description && (
                            <p className="text-white/80 text-sm mt-1">{lightboxImage.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
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
              {/* E‑Magazine Card */}
              <EMagazineSidebar />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
