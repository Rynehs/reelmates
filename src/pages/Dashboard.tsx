
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Plus, Clock, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPopularMovies } from "@/lib/api";
import { Movie, User, UserMovie } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<Partial<User>>({});
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<UserMovie[]>([]);
  const [toWatchMovies, setToWatchMovies] = useState<UserMovie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<UserMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated") === "true";
    if (!authenticated) {
      navigate("/");
      return;
    }
    
    // Get user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Get movies
    fetchMovies();
  }, [navigate]);
  
  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const movies = await getPopularMovies();
      setPopularMovies(movies);
      
      // Mock user movie lists
      setWatchedMovies([
        {
          id: "1",
          user_id: "1",
          movie_id: 1,
          status: "watched",
          created_at: new Date().toISOString()
        }
      ]);
      
      setToWatchMovies([
        {
          id: "2",
          user_id: "1",
          movie_id: 2,
          status: "to_watch",
          created_at: new Date().toISOString()
        }
      ]);
      
      setFavoriteMovies([
        {
          id: "3",
          user_id: "1",
          movie_id: 3,
          status: "favorite",
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMovie = (movieId: number, status: "watched" | "to_watch" | "favorite") => {
    // In a real app, we'd send this to the database
    toast({
      title: "Movie added",
      description: "The movie has been added to your list.",
    });
  };
  
  return (
    <div className="min-h-screen pb-20">
      <header className="app-header py-4">
        <div className="reelmates-container">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">ReelMates</h1>
            <Button variant="ghost" size="sm" onClick={() => navigate("/search")}>
              <Plus className="h-4 w-4 mr-1" />
              Add Movie
            </Button>
          </div>
        </div>
      </header>
      
      <main className="reelmates-container py-6">
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!</h2>
          <p className="text-muted-foreground mb-4">Track and share your movie experiences</p>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center">
                <Film className="h-4 w-4 mr-1" />
                <span>All Lists</span>
              </TabsTrigger>
              <TabsTrigger value="watched" className="flex items-center">
                <Badge variant="outline" className="mr-1">
                  {watchedMovies.length}
                </Badge>
                <span>Watched</span>
              </TabsTrigger>
              <TabsTrigger value="to-watch" className="flex items-center">
                <Badge variant="outline" className="mr-1">
                  {toWatchMovies.length}
                </Badge>
                <span>To Watch</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center">
                <Badge variant="outline" className="mr-1">
                  {favoriteMovies.length}
                </Badge>
                <span>Favorites</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="animate-fade-in">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {watchedMovies.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <h3 className="text-lg font-medium">Watched</h3>
                        <Badge className="ml-2 bg-green-500/10 text-green-600 border-green-200">
                          {watchedMovies.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {watchedMovies.map(userMovie => {
                          const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                          if (!movie) return null;
                          return (
                            <MovieCard
                              key={userMovie.id}
                              movie={movie}
                              status="watched"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {toWatchMovies.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <h3 className="text-lg font-medium">To Watch</h3>
                        <Badge className="ml-2 bg-blue-500/10 text-blue-600 border-blue-200">
                          {toWatchMovies.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {toWatchMovies.map(userMovie => {
                          const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                          if (!movie) return null;
                          return (
                            <MovieCard
                              key={userMovie.id}
                              movie={movie}
                              status="to_watch"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {favoriteMovies.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <h3 className="text-lg font-medium">Favorites</h3>
                        <Badge className="ml-2 bg-red-500/10 text-red-600 border-red-200">
                          {favoriteMovies.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {favoriteMovies.map(userMovie => {
                          const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                          if (!movie) return null;
                          return (
                            <MovieCard
                              key={userMovie.id}
                              movie={movie}
                              status="favorite"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {watchedMovies.length === 0 && toWatchMovies.length === 0 && favoriteMovies.length === 0 && (
                    <div className="text-center py-12">
                      <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No movies in your lists yet</h3>
                      <p className="text-muted-foreground mb-4">Start adding movies to your collection</p>
                      <Button onClick={() => navigate("/search")}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Movie
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="watched" className="animate-fade-in">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : watchedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchedMovies.map(userMovie => {
                    const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                    if (!movie) return null;
                    return (
                      <MovieCard
                        key={userMovie.id}
                        movie={movie}
                        status="watched"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No watched movies yet</h3>
                  <p className="text-muted-foreground mb-4">Movies you've watched will appear here</p>
                  <Button onClick={() => navigate("/search")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Watched Movie
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="to-watch" className="animate-fade-in">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : toWatchMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {toWatchMovies.map(userMovie => {
                    const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                    if (!movie) return null;
                    return (
                      <MovieCard
                        key={userMovie.id}
                        movie={movie}
                        status="to_watch"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Your watchlist is empty</h3>
                  <p className="text-muted-foreground mb-4">Add movies you want to watch later</p>
                  <Button onClick={() => navigate("/search")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Watchlist
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="animate-fade-in">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : favoriteMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favoriteMovies.map(userMovie => {
                    const movie = popularMovies.find(m => m.id === userMovie.movie_id);
                    if (!movie) return null;
                    return (
                      <MovieCard
                        key={userMovie.id}
                        movie={movie}
                        status="favorite"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No favorite movies yet</h3>
                  <p className="text-muted-foreground mb-4">Mark movies as favorites to find them easily</p>
                  <Button onClick={() => navigate("/search")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Favorite
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <Navbar />
    </div>
  );
};

export default Dashboard;
