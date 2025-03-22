import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { fetchMovieDetails, fetchTVShowDetails } from "@/lib/tmdb";
import { Movie, UserMedia } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [movies, setMovies] = useState({
    watched: [],
    toWatch: [],
    favorite: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserMovies = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from("user_movies")
          .select("id, user_id, movie_id, media_type, status")
          .eq("user_id", session.user.id);

        if (error) throw error;

        const userMedia = data.map(item => ({
          ...item,
          media_type: item.media_type || 'movie',
        }));

        const groupedMedia = {
          watched: [],
          toWatch: [],
          favorite: [],
        };

        for (const item of userMedia) {
          try {
            const mediaDetails = item.media_type === 'movie'
              ? await fetchMovieDetails(item.movie_id)
              : await fetchTVShowDetails(item.movie_id);

            if (mediaDetails) {
              groupedMedia[item.status].push({
                id: mediaDetails.id,
                title: mediaDetails.title || mediaDetails.name,
                poster_path: mediaDetails.poster_path,
                backdrop_path: mediaDetails.backdrop_path,
                release_date: mediaDetails.release_date || mediaDetails.first_air_date,
                vote_average: mediaDetails.vote_average,
                overview: mediaDetails.overview,
                genre_ids: mediaDetails.genre_ids,
              });
            }
          } catch (fetchError) {
            console.error(`Failed to fetch ${item.media_type} ${item.movie_id}:`, fetchError);
          }
        }

        setMovies(groupedMedia);
      } catch (error) {
        toast({ title: "Failed to fetch movies", description: error.message || "Please try again later", variant: "destructive" });
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
          watchedMovies={movies.watched}
          toWatchMovies={movies.toWatch}
          favoriteMovies={movies.favorite}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Dashboard;
