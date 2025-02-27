
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MovieCard from "@/components/MovieCard";
import { searchMovies, fetchTrendingMovies } from "@/lib/tmdb";
import { Movie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchIcon, Loader2 } from "lucide-react";

const Search = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch trending movies when the page loads
  const handleInitialLoad = async () => {
    if (movies.length === 0 && !isLoading) {
      setIsLoading(true);
      try {
        const response = await fetchTrendingMovies();
        setMovies(response.results);
      } catch (error: any) {
        toast({
          title: "Failed to fetch trending movies",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Call handleInitialLoad when the component mounts
  useState(() => {
    handleInitialLoad();
  });
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await searchMovies(query);
      setMovies(results.results);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToList = async (movie: Movie, status: "to_watch" | "watched" | "favorite") => {
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
      
      setIsAddingToList(prev => ({ ...prev, [movie.id]: true }));
      
      const { error } = await supabase.from("user_movies").upsert({
        user_id: session.user.id,
        movie_id: movie.id,
        status,
      });
      
      if (error) throw error;
      
      toast({
        title: "Movie added",
        description: `"${movie.title}" has been added to your ${status.replace("_", " ")} list`,
      });
      
      // Navigate back to dashboard after adding
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to add movie",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAddingToList(prev => ({ ...prev, [movie.id]: false }));
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Find Movies</h1>
          
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </form>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <Card key={movie.id} className="overflow-hidden">
                  <MovieCard movie={movie} />
                  <CardContent className="p-4 bg-card flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => addToList(movie, "to_watch")}
                      disabled={isAddingToList[movie.id]}
                    >
                      {isAddingToList[movie.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Watch Later"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => addToList(movie, "watched")}
                      disabled={isAddingToList[movie.id]}
                    >
                      {isAddingToList[movie.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Watched"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => addToList(movie, "favorite")}
                      disabled={isAddingToList[movie.id]}
                    >
                      {isAddingToList[movie.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Favorite"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {query ? "No movies found for your search" : "Search for movies to add to your list"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
