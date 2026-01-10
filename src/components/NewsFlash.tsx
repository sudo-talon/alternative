import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

type NewsItem = {
  id: string;
  title: string;
  content: string;
  published_at: string;
  created_at: string;
  featured_image_url?: string | null;
};

export const NewsFlash = () => {
  const { t } = useLanguage();
  
  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("NewsFlash fetch error:", error);
        throw error;
      }
      return data as NewsItem[];
    },
  });

  return (
    <Card className="shadow-elevated overflow-hidden w-full max-w-full">
      <CardHeader className="bg-gradient-accent">
        <CardTitle className="text-primary-foreground text-base sm:text-lg">{t('newsFlash')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] sm:h-[400px] overflow-hidden relative w-full">
          {isLoading ? (
            <div className="px-4 py-4 text-center text-muted-foreground">Loading news...</div>
          ) : news && news.length > 0 ? (
            <div className="animate-marquee-vertical">
              <div className="space-y-0">
                <div className="px-3 sm:px-4 py-4 space-y-3 sm:space-y-4">
                  {news.map((item, index) => (
                    <div 
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                        const imageBlock = item.featured_image_url 
                          ? `<img src="${item.featured_image_url}" alt="${item.title}" class="w-full h-40 sm:h-56 object-cover rounded-md mb-4" />`
                          : '';
                        modal.innerHTML = `
                          <div class="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6 relative mx-4">
                            <button class="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground p-1" onclick="this.parentElement.parentElement.remove()">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            ${imageBlock}
                            <h2 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 pr-8">${item.title}</h2>
                            <p class="text-sm text-muted-foreground mb-4 sm:mb-6">${formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</p>
                            <p class="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">${item.content}</p>
                          </div>
                        `;
                        modal.onclick = (e) => {
                          if (e.target === modal) modal.remove();
                        };
                        document.body.appendChild(modal);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {item.featured_image_url && (
                          <img 
                            src={item.featured_image_url} 
                            alt={item.title} 
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-md shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                          <p className="text-xs text-accent">
                            {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {index < news.length - 1 && <Separator className="mt-3 sm:mt-4" />}
                    </div>
                  ))}
                </div>
                {/* Duplicate for seamless loop */}
                <div className="px-3 sm:px-4 py-4 space-y-3 sm:space-y-4">
                  {news.map((item, index) => (
                    <div 
                      key={`duplicate-${item.id}`}
                      className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      onClick={() => {
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                        const imageBlock = item.featured_image_url 
                          ? `<img src="${item.featured_image_url}" alt="${item.title}" class="w-full h-40 sm:h-56 object-cover rounded-md mb-4" />`
                          : '';
                        modal.innerHTML = `
                          <div class="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6 relative mx-4">
                            <button class="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground p-1" onclick="this.parentElement.parentElement.remove()">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            ${imageBlock}
                            <h2 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 pr-8">${item.title}</h2>
                            <p class="text-sm text-muted-foreground mb-4 sm:mb-6">${formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</p>
                            <p class="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">${item.content}</p>
                          </div>
                        `;
                        modal.onclick = (e) => {
                          if (e.target === modal) modal.remove();
                        };
                        document.body.appendChild(modal);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {item.featured_image_url && (
                          <img 
                            src={item.featured_image_url} 
                            alt={item.title} 
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-md shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                          <p className="text-xs text-accent">
                            {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {index < news.length - 1 && <Separator className="mt-3 sm:mt-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-muted-foreground">No news available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
