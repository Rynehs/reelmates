
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails } from "@/lib/tmdb";
import { Movie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface UserMovie {
  id: string;
  movie_id: number;
  status: string;
  rating: number | null;
  user_id: string;
}

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
        
        const { data: userMovies, error } = await supabase
          .from("user_movies")
          .select("*")
          .eq("user_id", session.user.id);
          
        if (error) {
          throw error;
        }
        
        const watchedData: UserMovie[] = userMovies.filter(movie => movie.status === "watched");
        const toWatchData: UserMovie[] = userMovies.filter(movie => movie.status === "to_watch");
        const favoriteData: UserMovie[] = userMovies.filter(movie => movie.status === "favorite");
        
        // Fetch full movie details for each movie ID
        const [watched, toWatch, favorites] = await Promise.all([
          Promise.all(watchedData.map(movie => fetchMovieDetails(movie.movie_id))),
          Promise.all(toWatchData.map(movie => fetchMovieDetails(movie.movie_id))),
          Promise.all(favoriteData.map(movie => fetchMovieDetails(movie.movie_id)))
        ]);
        
        setWatchedMovies(watched);
        setToWatchMovies(toWatch);
        setFavoriteMovies(favorites);
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
