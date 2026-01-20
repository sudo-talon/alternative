import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseClient as supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: news, isLoading, error } = useQuery({
    queryKey: ["news-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("No news ID provided");
      
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 mt-20">
          <Button variant="ghost" className="mb-6" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-[400px] w-full mb-8 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 mt-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">News Article Not Found</h1>
          <p className="text-slate-600 mb-8">The news article you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/news")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-20">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-slate-200" 
          onClick={() => navigate("/news")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>

        <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {news.featured_image_url && (
            <div className="w-full h-[400px] relative">
              <img 
                src={news.featured_image_url} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500 mb-6">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                News
              </Badge>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {format(new Date(news.published_at || news.created_at), "MMMM d, yyyy")}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {format(new Date(news.published_at || news.created_at), "h:mm a")}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
              {news.title}
            </h1>

            <div className="prose prose-slate max-w-none lg:prose-lg">
              {news.content.split('\n').map((paragraph: string, index: number) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                    {paragraph}
                  </p>
                )
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
              <div className="text-slate-500 text-sm">
                Shared by Defence Intelligence College
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You might want to add a toast notification here
              }}>
                <Share2 className="mr-2 h-4 w-4" /> Share Article
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
