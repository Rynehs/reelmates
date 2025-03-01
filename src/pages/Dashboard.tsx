
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails, fetchTVShowDetails } from "@/lib/tmdb";
import { Movie, TVShow, UserMedia } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface DatabaseUserMedia {
  id: string;
  user_id: string;
  movie_id: number; // This is actually media_id
  media_type?: 'movie' | 'tv';
  status: string;
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

const Dashboard = () => {
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [toWatchMovies, setToWatchMovies] = useState<Movie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  
  // Function to force a refresh of the movie lists
  const refreshMovies = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    // Subscribe to auth changes to handle multi-device login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshMovies();
      }
    });
    
    // Return the cleanup function directly
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    const fetchUserMovies = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setWatchedMovies([]);
          setToWatchMovies([]);
          setFavoriteMovies([]);
          setIsLoading(false);
          return;
        }
        
        const { data: userMediaFromDB, error } = await supabase
          .from("user_movies")
          .select("*")
          .eq("user_id", session.user.id);
          
        if (error) {
          throw error;
        }
        
        // Map database fields to UserMedia interface
        const userMedia: UserMedia[] = (userMediaFromDB as DatabaseUserMedia[]).map(item => ({
          id: item.id,
          user_id: item.user_id,
          media_id: item.movie_id, // Map movie_id to media_id
          media_type: item.media_type || 'movie', // Default to movie if not specified
          status: item.status as 'watched' | 'to_watch' | 'favorite',
          rating: item.rating,
          notes: item.notes,
          created_at: item.created_at
        }));
        
        const watchedData: UserMedia[] = userMedia.filter(item => item.status === "watched");
        const toWatchData: UserMedia[] = userMedia.filter(item => item.status === "to_watch");
        const favoriteData: UserMedia[] = userMedia.filter(item => item.status === "favorite");
        
        // Fetch full details for each media item
        const watched = await Promise.all(
          watchedData.map(async (item) => {
            try {
              if (item.media_type === 'movie') {
                return await fetchMovieDetails(item.media_id);
              } else {
                // Convert TV show to Movie format for existing component
                const tvShow = await fetchTVShowDetails(item.media_id);
                return {
                  id: tvShow.id,
                  title: tvShow.name,
                  poster_path: tvShow.poster_path,
                  backdrop_path: tvShow.backdrop_path,
                  release_date: tvShow.first_air_date,
                  vote_average: tvShow.vote_average,
                  overview: tvShow.overview,
                  genre_ids: tvShow.genre_ids,
                  media_type: 'tv' // Keep the correct media type
                } as unknown as Movie;
              }
            } catch (error) {
              console.error(`Failed to fetch details for ${item.media_type} ${item.media_id}:`, error);
              return null;
            }
          })
        );
        
        const toWatch = await Promise.all(
          toWatchData.map(async (item) => {
            try {
              if (item.media_type === 'movie') {
                return await fetchMovieDetails(item.media_id);
              } else {
                // Convert TV show to Movie format for existing component
                const tvShow = await fetchTVShowDetails(item.media_id);
                return {
                  id: tvShow.id,
                  title: tvShow.name,
                  poster_path: tvShow.poster_path,
                  backdrop_path: tvShow.backdrop_path,
                  release_date: tvShow.first_air_date,
                  vote_average: tvShow.vote_average,
                  overview: tvShow.overview,
                  genre_ids: tvShow.genre_ids,
                  media_type: 'tv' // Keep the correct media type
                } as unknown as Movie;
              }
            } catch (error) {
              console.error(`Failed to fetch details for ${item.media_type} ${item.media_id}:`, error);
              return null;
            }
          })
        );
        
        const favorites = await Promise.all(
          favoriteData.map(async (item) => {
            try {
              if (item.media_type === 'movie') {
                return await fetchMovieDetails(item.media_id);
              } else {
                // Convert TV show to Movie format for existing component
                const tvShow = await fetchTVShowDetails(item.media_id);
                return {
                  id: tvShow.id,
                  title: tvShow.name,
                  poster_path: tvShow.poster_path,
                  backdrop_path: tvShow.backdrop_path,
                  release_date: tvShow.first_air_date,
                  vote_average: tvShow.vote_average,
                  overview: tvShow.overview,
                  genre_ids: tvShow.genre_ids,
                  media_type: 'tv' // Keep the correct media type
                } as unknown as Movie;
              }
            } catch (error) {
              console.error(`Failed to fetch details for ${item.media_type} ${item.media_id}:`, error);
              return null;
            }
          })
        );
        
        // Filter out any null results from failed fetches
        setWatchedMovies(watched.filter((item): item is Movie => item !== null));
        setToWatchMovies(toWatch.filter((item): item is Movie => item !== null));
        setFavoriteMovies(favorites.filter((item): item is Movie => item !== null));
      } catch (error: any) {
        toast({
          title: "Failed to fetch movies",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserMovies();
  }, [toast, refreshTrigger]); // Add refreshTrigger to dependencies to force refresh
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <MovieList
          watchedMovies={watchedMovies}
          toWatchMovies={toWatchMovies}
          favoriteMovies={favoriteMovies}
          isLoading={isLoading}
          onStatusChange={refreshMovies}
        />
      </main>
    </div>
  );
};

export default Dashboard;
