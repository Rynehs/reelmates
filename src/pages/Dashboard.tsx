import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails, fetchTVShowDetails, fetchTrendingMovies } from "@/lib/tmdb";
import { Movie, TVShow, UserMedia } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { MovieCarousel } from "@/components/MovieCarousel"; // Component for displaying trending movies

const Dashboard = () => {
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [toWatchMovies, setToWatchMovies] = useState<Movie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserMovies = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data: userMediaFromDB, error } = await supabase
          .from("user_movies")
          .select("*")
          .eq("user_id", session.user.id);
          
        if (error) throw error;
        
        const userMedia: UserMedia[] = userMediaFromDB.map(item => ({
          id: item.id,
          user_id: item.user_id,
          media_id: item.movie_id,
          media_type: item.media_type || 'movie',
          status: item.status,
          rating: item.rating,
          notes: item.notes,
          created_at: item.created_at
        }));
        
        const watchedData = userMedia.filter(item => item.status === "watched");
        const toWatchData = userMedia.filter(item => item.status === "to_watch");
        const favoriteData = userMedia.filter(item => item.status === "favorite");
        
        const fetchDetails = async (item: UserMedia) => {
          try {
            return item.media_type === 'movie' 
              ? await fetchMovieDetails(item.media_id) 
              : await fetchTVShowDetails(item.media_id);
          } catch (error) {
            console.error(`Failed to fetch details for ${item.media_type} ${item.media_id}:`, error);
            return null;
          }
        };
        
        setWatchedMovies((await Promise.all(watchedData.map(fetchDetails))).filter(Boolean));
        setToWatchMovies((await Promise.all(toWatchData.map(fetchDetails))).filter(Boolean));
        setFavoriteMovies((await Promise.all(favoriteData.map(fetchDetails))).filter(Boolean));
      } catch (error: any) {
        toast({ title: "Failed to fetch movies", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchTrending = async () => {
      try {
        const trending = await fetchTrendingMovies();
        setTrendingMovies(trending);
      } catch (error) {
        console.error("Failed to fetch trending movies:", error);
      }
    };
    
    fetchUserMovies();
    fetchTrending();
  }, [toast]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MovieList
          watchedMovies={watchedMovies}
          toWatchMovies={toWatchMovies}
          favoriteMovies={favoriteMovies}
          isLoading={isLoading}
        />
        
        {/* Explore Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Explore Trending Movies</h2>
          <MovieCarousel movies={trendingMovies} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
