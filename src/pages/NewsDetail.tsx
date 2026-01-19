import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabaseClient as supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type NewsRow = Database["public"]["Tables"]["news"]["Row"];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: news, isLoading } = useQuery<NewsRow | null>({
    queryKey: ["news-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as NewsRow) || null;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container mx-auto px-4 py-8 md:py-12">
        <Button variant="outline" onClick={() => navigate(-1)} className="min-h-[44px] mb-6">
          Back
        </Button>
        {isLoading ? (
          <Card className="shadow-elevated">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-64 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </CardContent>
          </Card>
        ) : news ? (
          <Card className="shadow-elevated overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{news.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {news.featured_image_url ? (
                <img
                  src={news.featured_image_url}
                  alt={news.title}
                  className="w-full h-auto rounded-lg object-cover max-h-[420px]"
                />
              ) : null}
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {news.content}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elevated">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">News item not found</p>
              <Button variant="link" onClick={() => navigate("/news")} className="mt-2">
                Go to News
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default NewsDetail;
