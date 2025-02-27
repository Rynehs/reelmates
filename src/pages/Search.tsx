
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import Navbar from "@/components/Navbar";
import { Movie } from "@/lib/types";
import { searchMovies, getPopularMovies } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated") === "true";
    if (!authenticated) {
      navigate("/");
      return;
    }
    
    // Load popular movies
    loadPopularMovies();
  }, [navigate]);
  
  const loadPopularMovies = async () => {
    setIsLoading(true);
    try {
      const movies = await getPopularMovies();
      setPopularMovies(movies);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setIsLoading(true);
    
    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching movies:", error);
      toast({
        title: "Search Error",
        description: "Failed to search movies. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <header className="app-header py-4">
        <div className="reelmates-container">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-xl font-semibold flex-1">Find Movies</h1>
          </div>
          <div className="mt-3">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for movies..."
              initialValue={query}
            />
          </div>
        </div>
      </header>
      
      <main className="reelmates-container py-6">
        <section className="animate-fade-in">
          {isSearching ? (
            <>
              <h2 className="text-lg font-medium mb-4">
                {isLoading 
                  ? "Searching..." 
                  : searchResults.length > 0 
                    ? `Results for "${query}"` 
                    : `No results for "${query}"`}
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => handleMovieClick(movie.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No movies found matching your search</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setQuery("");
                      setIsSearching(false);
                    }}
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium mb-4">Popular Movies</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-[2/3]"></div>
                      <div className="mt-2 bg-muted h-4 rounded w-3/4"></div>
                      <div className="mt-1 bg-muted h-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {popularMovies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => handleMovieClick(movie.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      
      <Navbar />
    </div>
  );
};

export default Search;
