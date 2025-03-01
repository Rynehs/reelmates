
import { useState } from "react";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieListProps {
  watchedMovies: Movie[];
  toWatchMovies: Movie[];
  favoriteMovies: Movie[];
  isLoading: boolean;
  onStatusChange?: () => void;
}

export const MovieList = ({
  watchedMovies = [],
  toWatchMovies = [],
  favoriteMovies = [],
  isLoading,
  onStatusChange
}: MovieListProps) => {
  const [activeTab, setActiveTab] = useState<string>("to-watch");

  const getEmptyStateMessage = (tab: string) => {
    if (tab === "to-watch") {
      return "No movies in your watch list yet";
    } else if (tab === "watched") {
      return "You haven't marked any movies as watched yet";
    } else {
      return "You don't have any favorite movies yet";
    }
  };

  const renderMovies = (movies: Movie[], status?: "watched" | "to_watch" | "favorite") => {
    if (isLoading) {
      return Array(4)
        .fill(null)
        .map((_, index) => (
          <div key={index} className="h-64">
            <Skeleton className="h-full w-full" />
          </div>
        ));
    }

    if (movies.length === 0) {
      return (
        <div className="col-span-full py-10 text-center">
          <p className="text-muted-foreground">{getEmptyStateMessage(activeTab)}</p>
        </div>
      );
    }

    return movies.map((movie) => (
      <MovieCard 
        key={`${movie.id}-${movie.media_type || 'movie'}`} 
        media={movie} 
        status={status}
        showActions={true}
        onStatusChange={onStatusChange}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Lists</h2>
          <TabsList>
            <TabsTrigger value="to-watch">To Watch ({toWatchMovies.length})</TabsTrigger>
            <TabsTrigger value="watched">Watched ({watchedMovies.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favoriteMovies.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="to-watch" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {renderMovies(toWatchMovies, "to_watch")}
        </TabsContent>
        
        <TabsContent value="watched" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {renderMovies(watchedMovies, "watched")}
        </TabsContent>
        
        <TabsContent value="favorites" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {renderMovies(favoriteMovies, "favorite")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
