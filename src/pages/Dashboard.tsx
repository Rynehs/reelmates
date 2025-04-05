
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails, fetchTVShowDetails, fetchTrendingMovies } from "@/lib/tmdb";
import { Movie, TVShow, UserMedia, MediaItem } from "@/lib/types";
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
          media_type: (item.media_type || 'movie') as 'movie' | 'tv', // Cast to the correct union type
          status: item.status as 'watched' | 'to_watch' | 'favorite',
          rating: item.rating,
          notes: item.notes,
          created_at: item.created_at
        }));
        
        const watchedData = userMedia.filter(item => item.status === "watched");
        const toWatchData = userMedia.filter(item => item.status === "to_watch");
        const favoriteData = userMedia.filter(item => item.status === "favorite");
        
        const fetchDetails = async (item: UserMedia) => {
          try {
            if (item.media_type === 'movie') {
              const movieDetails = await fetchMovieDetails(item.media_id);
              return movieDetails as unknown as Movie; // Cast to Movie type
            } else {
              const tvDetails = await fetchTVShowDetails(item.media_id);
              // Convert TVShow to Movie-compatible format to avoid type errors
              return {
                id: tvDetails.id,
                title: tvDetails.name,
                poster_path: tvDetails.poster_path,
                backdrop_path: tvDetails.backdrop_path,
                release_date: tvDetails.first_air_date,
                vote_average: tvDetails.vote_average,
                overview: tvDetails.overview,
                genre_ids: tvDetails.genre_ids || [],
                media_type: 'movie'
              } as Movie;
            }
          } catch (error) {
            console.error(`Failed to fetch details for ${item.media_type} ${item.media_id}:`, error);
            return null;
          }
        };
        
        const watched = await Promise.all(watchedData.map(fetchDetails));
        const toWatch = await Promise.all(toWatchData.map(fetchDetails));
        const favorites = await Promise.all(favoriteData.map(fetchDetails));
        
        setWatchedMovies(watched.filter(Boolean) as Movie[]);
        setToWatchMovies(toWatch.filter(Boolean) as Movie[]);
        setFavoriteMovies(favorites.filter(Boolean) as Movie[]);
      } catch (error: any) {
        toast({ title: "Failed to fetch movies", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchTrending = async () => {
      try {
        const trending = await fetchTrendingMovies();
        // Extract just the results array which contains the movies
        setTrendingMovies(trending.results as Movie[]);
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
