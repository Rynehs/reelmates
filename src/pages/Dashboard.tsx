
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails, fetchTVShowDetails } from "@/lib/tmdb";
import { Movie, TVShow, UserMedia } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [toWatchMovies, setToWatchMovies] = useState<Movie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserMovies = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          return;
        }
        
        const { data: userMedia, error } = await supabase
          .from("user_movies")
          .select("*")
          .eq("user_id", session.user.id);
          
        if (error) {
          throw error;
        }
        
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
                  media_type: 'movie' // We'll convert this within MovieList
                } as Movie;
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
                  media_type: 'movie' // We'll convert this within MovieList
                } as Movie;
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
                  media_type: 'movie' // We'll convert this within MovieList
                } as Movie;
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
      </main>
    </div>
  );
};

export default Dashboard;
