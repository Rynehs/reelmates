
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  fetchMovieDetails, 
  fetchMovieWatchProviders,
  getImageUrl 
} from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  Calendar, 
  Heart, 
  CheckCircle, 
  Play, 
  ExternalLink, 
  Loader2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import MovieCard from "@/components/MovieCard";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [watchProviders, setWatchProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch movie details and watch providers in parallel
        const [movieData, providersData] = await Promise.all([
          fetchMovieDetails(parseInt(id)),
          fetchMovieWatchProviders(parseInt(id))
        ]);
        
        setMovie(movieData);
        
        // Extract US providers or use first available country
        const providerResults = providersData.results || {};
        const usProviders = providerResults.US;
        const firstCountry = Object.keys(providerResults)[0];
        
        setWatchProviders(usProviders || (firstCountry ? providerResults[firstCountry] : null));
      } catch (err: any) {
        console.error("Error fetching movie:", err);
        setError(err.message || "Failed to load movie details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovie();
  }, [id]);
  
  const addToList = async (status: "to_watch" | "watched" | "favorite") => {
    if (!movie) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add movies to your list",
          variant: "destructive",
        });
        return;
      }
      
      setIsAddingToList(true);
      
      const { error } = await supabase.from("user_movies").upsert({
        user_id: session.user.id,
        movie_id: movie.id, // Database field is movie_id
        media_type: 'movie',
        status,
      });
      
      if (error) throw error;
      
      toast({
        title: "Movie added",
        description: `"${movie.title}" has been added to your ${status.replace("_", " ")} list`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add movie",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAddingToList(false);
    }
  };
  
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
  
  // Find trailer
  const trailer = movie.videos?.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );
  
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
              
              <div className="mt-4 space-y-2">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Trailer
                    </Button>
                  </a>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => addToList("to_watch")}
                    disabled={isAddingToList}
                  >
                    {isAddingToList ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Watch Later
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => addToList("watched")}
                    disabled={isAddingToList}
                  >
                    {isAddingToList ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Watched
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => addToList("favorite")}
                    disabled={isAddingToList}
                  >
                    {isAddingToList ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Favorite
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Watch Providers */}
              {watchProviders && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Where to Watch</h3>
                  
                  {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Stream</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchProviders.flatrate.map((provider: any) => (
                          <div key={provider.provider_id} className="relative group">
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-10 h-10 rounded"
                              title={provider.provider_name}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                              {provider.provider_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {watchProviders.rent && watchProviders.rent.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Rent</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchProviders.rent.map((provider: any) => (
                          <div key={provider.provider_id} className="relative group">
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-10 h-10 rounded"
                              title={provider.provider_name}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                              {provider.provider_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {watchProviders.buy && watchProviders.buy.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Buy</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchProviders.buy.map((provider: any) => (
                          <div key={provider.provider_id} className="relative group">
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="w-10 h-10 rounded"
                              title={provider.provider_name}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                              {provider.provider_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {watchProviders.link && (
                    <a 
                      href={watchProviders.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline inline-flex items-center"
                    >
                      View all watch options
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
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
              
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cast">Cast</TabsTrigger>
                  {movie.similar?.results.length ? (
                    <TabsTrigger value="similar">Similar</TabsTrigger>
                  ) : null}
                  {movie.reviews?.results.length ? (
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  ) : null}
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="space-y-4">
                    {movie.tagline && (
                      <p className="text-lg italic text-muted-foreground">"{movie.tagline}"</p>
                    )}
                    <p className="text-muted-foreground">{movie.overview}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="cast" className="mt-4">
                  {movie.credits?.cast && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {movie.credits.cast.slice(0, 8).map((actor) => (
                        <div key={actor.id} className="text-center">
                          <div className="overflow-hidden rounded-full w-20 h-20 mx-auto mb-2">
                            {actor.profile_path ? (
                              <img
                                src={getImageUrl(actor.profile_path)}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                {actor.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <p className="font-medium text-sm">{actor.name}</p>
                          <p className="text-xs text-muted-foreground">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="similar" className="mt-4">
                  {movie.similar?.results && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {movie.similar.results.slice(0, 6).map((similar) => (
                        <MovieCard 
                          key={similar.id} 
                          media={{...similar, media_type: 'movie'}}
                          showActions={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-4">
                  {movie.reviews?.results && movie.reviews.results.length > 0 ? (
                    <div className="space-y-4">
                      {movie.reviews.results.slice(0, 3).map((review) => (
                        <div key={review.id} className="border p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="font-medium">{review.author}</div>
                            <div className="text-xs text-muted-foreground ml-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-sm">
                            {review.content.length > 300
                              ? `${review.content.slice(0, 300)}...`
                              : review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews available</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetails;
