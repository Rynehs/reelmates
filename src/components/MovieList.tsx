
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/MovieCard";
import { MediaItem } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieListProps {
  watchedMovies: MediaItem[];
  toWatchMovies: MediaItem[];
  favoriteMovies: MediaItem[];
  isLoading: boolean;
}

export const MovieList = ({
  watchedMovies,
  toWatchMovies,
  favoriteMovies,
  isLoading,
}: MovieListProps) => {
  const [activeTab, setActiveTab] = useState<string>("to-watch");
  const navigate = useNavigate();
  
  const handleAddMovie = () => {
    navigate("/search");
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Movies</h2>
          <Button onClick={handleAddMovie}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Movie
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading your movie lists...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Movies</h2>
        <Button onClick={handleAddMovie}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Movie
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="to-watch">
            To Watch ({toWatchMovies.length})
          </TabsTrigger>
          <TabsTrigger value="watched">
            Watched ({watchedMovies.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({favoriteMovies.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="to-watch" className="space-y-4">
          {toWatchMovies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't added any movies to your watch list yet.
                </p>
                <Button onClick={handleAddMovie}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Movie
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toWatchMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  media={movie} 
                  status="to_watch"
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="watched" className="space-y-4">
          {watchedMovies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't marked any movies as watched yet.
                </p>
                <Button onClick={handleAddMovie}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Find Movies to Watch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchedMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  media={movie}
                  status="watched"
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="space-y-4">
          {favoriteMovies.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't added any favorite movies yet.
                </p>
                <Button onClick={handleAddMovie}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Find Movies to Add
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  media={movie}
                  status="favorite"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
