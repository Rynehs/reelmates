
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MovieCard from "@/components/MovieCard";
import { 
  searchMovies, 
  searchTVShows, 
  multiSearch, 
  fetchTrendingMovies, 
  fetchTrendingTVShows,
  fetchMovieGenres,
  fetchTVGenres,
  discoverMovies,
  discoverTVShows
} from "@/lib/tmdb";
import { Movie, TVShow, MediaItem, Genre } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchIcon, Film, Tv, Users, Filter, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Search = () => {
  const [query, setQuery] = useState("");
  const [media, setMedia] = useState<(Movie | TVShow | MediaItem)[]>([]);
  const [mediaType, setMediaType] = useState<"movie" | "tv" | "multi">("multi");
  const [isLoading, setIsLoading] = useState(false);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [year, setYear] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch genres and trending content when the page loads
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([
          fetchMovieGenres(),
          fetchTVGenres()
        ]);
        
        setMovieGenres(movieGenresData.genres);
        setTvGenres(tvGenresData.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    
    const fetchInitialContent = async () => {
      if (media.length === 0 && !isLoading) {
        setIsLoading(true);
        try {
          const [moviesResponse, tvShowsResponse] = await Promise.all([
            fetchTrendingMovies(),
            fetchTrendingTVShows()
          ]);
          
          // Combine and limit results
          const combined = [...moviesResponse.results, ...tvShowsResponse.results]
            .sort(() => Math.random() - 0.5) // Shuffle
            .slice(0, 18); // Take top 18
          
          setMedia(combined);
        } catch (error: any) {
          toast({
            title: "Failed to fetch trending content",
            description: error.message || "Please try again later",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchGenres();
    fetchInitialContent();
  }, [media.length, isLoading, toast]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() && !selectedGenre) {
      return;
    }
    
    setIsLoading(true);
    try {
      let results;
      
      if (query.trim()) {
        // Text search
        if (mediaType === "movie") {
          results = await searchMovies(query);
        } else if (mediaType === "tv") {
          results = await searchTVShows(query);
        } else {
          results = await multiSearch(query);
        }
        setMedia(results.results);
      } else {
        // Discover by filters
        const params: any = {
          sort_by: sortBy,
        };
        
        if (selectedGenre) {
          params.with_genres = selectedGenre;
        }
        
        if (year) {
          if (mediaType === "movie") {
            params.year = year;
          } else {
            params.first_air_date_year = year;
          }
        }
        
        if (mediaType === "movie") {
          results = await discoverMovies(params);
        } else if (mediaType === "tv") {
          results = await discoverTVShows(params);
        } else {
          // For multi, we'll need to make two requests and combine results
          const [movieResults, tvResults] = await Promise.all([
            discoverMovies(params),
            discoverTVShows(params)
          ]);
          
          // Combine and sort by popularity
          results = {
            results: [...movieResults.results, ...tvResults.results]
              .sort((a, b) => b.vote_average - a.vote_average)
              .slice(0, 20)
          };
        }
        
        setMedia(results.results);
      }
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
  
  // Fix: "movieType" is not defined, changed to "mediaType"
  const currentGenres = mediaType === "tv" ? tvGenres : mediaType === "multi" ? [...movieGenres, ...tvGenres] : movieGenres;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Discover Movies & TV Shows</h1>
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <Select 
                  value={mediaType} 
                  onValueChange={(value: "movie" | "tv" | "multi") => setMediaType(value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">
                      <div className="flex items-center">
                        <Film className="w-4 h-4 mr-2" />
                        Movies
                      </div>
                    </SelectItem>
                    <SelectItem value="tv">
                      <div className="flex items-center">
                        <Tv className="w-4 h-4 mr-2" />
                        TV Shows
                      </div>
                    </SelectItem>
                    <SelectItem value="multi">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        All Content
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search for movies or TV shows..."
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
              </div>
            </TabsContent>
            
            <TabsContent value="discover" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select 
                  value={mediaType} 
                  onValueChange={(value: "movie" | "tv" | "multi") => setMediaType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movie">
                      <div className="flex items-center">
                        <Film className="w-4 h-4 mr-2" />
                        Movies
                      </div>
                    </SelectItem>
                    <SelectItem value="tv">
                      <div className="flex items-center">
                        <Tv className="w-4 h-4 mr-2" />
                        TV Shows
                      </div>
                    </SelectItem>
                    <SelectItem value="multi">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        All Content
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedGenre} 
                  onValueChange={setSelectedGenre}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genres</SelectItem>
                    {currentGenres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={year} 
                  onValueChange={setYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={sortBy} 
                  onValueChange={setSortBy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity.desc">Popularity</SelectItem>
                    <SelectItem value="vote_average.desc">Rating</SelectItem>
                    <SelectItem value="primary_release_date.desc">Release Date</SelectItem>
                    <SelectItem value="revenue.desc">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                Discover Content
              </Button>
            </TabsContent>
          </Tabs>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : media.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {media.map((item) => (
                <Card key={`${item.media_type}-${item.id}`} className="overflow-hidden h-full">
                  <MovieCard media={item} showActions={true} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {query ? "No results found for your search" : "Search or discover movies and TV shows to add to your list"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Search;
