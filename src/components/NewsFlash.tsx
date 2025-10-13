import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

export const NewsFlash = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="shadow-elevated overflow-hidden">
      <CardHeader className="bg-gradient-accent">
        <CardTitle className="text-primary-foreground">News Flash</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-hidden relative">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading news...</div>
          ) : news && news.length > 0 ? (
            <div className="animate-marquee-vertical">
              <div className="p-4 space-y-4">
                {news.map((item, index) => (
                  <div 
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                      modal.innerHTML = `
                        <div class="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                          <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onclick="this.parentElement.parentElement.remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          <h2 class="text-2xl font-bold mb-4">${item.title}</h2>
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
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                      <p className="text-xs text-accent">
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </p>
                    </div>
                    {index < news.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
              {/* Duplicate for seamless loop */}
              <div className="p-4 space-y-4">
                {news.map((item, index) => (
                  <div 
                    key={`duplicate-${item.id}`}
                    className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      const modal = document.createElement('div');
                      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
                      modal.innerHTML = `
                        <div class="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
                          <button class="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onclick="this.parentElement.parentElement.remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          <h2 class="text-2xl font-bold mb-4">${item.title}</h2>
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
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                      <p className="text-xs text-accent">
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </p>
                    </div>
                    {index < news.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No news available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
