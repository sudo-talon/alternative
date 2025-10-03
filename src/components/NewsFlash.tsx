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
    <Card className="shadow-elevated">
      <CardHeader className="bg-gradient-accent">
        <CardTitle className="text-primary-foreground">News Flash</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading news...</div>
          ) : news && news.length > 0 ? (
            <div className="p-4 space-y-4">
              {news.map((item, index) => (
                <div key={item.id}>
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
          ) : (
            <div className="p-4 text-center text-muted-foreground">No news available</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
