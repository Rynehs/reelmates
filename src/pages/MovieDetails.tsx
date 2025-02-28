
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { fetchMovieDetails } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Movie, MovieDetails } from "@/lib/types";
import { ArrowLeft, Clock, Star, Calendar } from "lucide-react";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // We'll treat the returned data as MovieDetails to access the extended properties
        const movieData = await fetchMovieDetails(parseInt(id)) as unknown as MovieDetails;
        setMovie(movieData);
      } catch (err: any) {
        console.error("Error fetching movie:", err);
        setError(err.message || "Failed to load movie details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-5">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-72 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              {error || "Movie not found"}
            </h2>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {movie.backdrop_path && (
          <div className="relative h-[40vh] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
            <img
              src={getImageUrl(movie.backdrop_path, "original")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                </div>
                
                {/* Only display runtime if it exists */}
                {movie.runtime && (
                  <div className="flex items-center text-sm">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
              </div>
              
              {/* Only display genres if they exist */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-muted-foreground">{movie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
