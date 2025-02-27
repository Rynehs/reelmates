
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Play, 
  Eye, 
  EyeOff, 
  Heart,
  Share2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import { MovieDetails as MovieDetailsType } from "@/lib/types";
import { getMovieDetails, getBackdropUrl, getPosterUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [status, setStatus] = useState<"watched" | "to_watch" | "favorite" | null>(null);
  
  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated") === "true";
    if (!authenticated) {
      navigate("/");
      return;
    }
    
    if (id) {
      fetchMovieDetails(parseInt(id));
    }
  }, [id, navigate]);
  
  const fetchMovieDetails = async (movieId: number) => {
    setIsLoading(true);
    try {
      const details = await getMovieDetails(movieId);
      setMovie(details);
      
      // In a real app, we'd check if the user has this movie in their list
      // For demo purposes, let's set a random status
      const statuses = [null, "watched", "to_watch", "favorite"] as const;
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      toast({
        title: "Error",
        description: "Failed to load movie details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddToList = (newStatus: "watched" | "to_watch" | "favorite") => {
    // In a real app, we'd send this to the database
    setStatus(newStatus);
    
    toast({
      title: "Movie added",
      description: `Added to your ${
        newStatus === "watched" 
          ? "watched list" 
          : newStatus === "to_watch" 
          ? "watch later list" 
          : "favorites"
      }`,
    });
  };
  
  const handleRemoveFromList = () => {
    // In a real app, we'd send this to the database
    setStatus(null);
    
    toast({
      title: "Movie removed",
      description: "Removed from your list",
    });
  };
  
  const handleShare = () => {
    // In a real app, we'd open a share dialog or copy to clipboard
    toast({
      title: "Share link copied",
      description: "Movie link copied to clipboard",
    });
  };
  
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading || !movie) {
    return (
      <div className="min-h-screen pb-20">
        <header className="app-header py-4">
          <div className="reelmates-container">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-xl font-semibold">Movie Details</h1>
            </div>
          </div>
        </header>
        
        <main className="reelmates-container py-6">
          <div className="animate-pulse">
            <div className="w-full h-48 sm:h-64 bg-muted rounded-lg mb-4"></div>
            <div className="flex gap-4 mb-4">
              <div className="w-24 sm:w-32 h-36 sm:h-48 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="h-10 bg-muted rounded w-full mb-4"></div>
              </div>
            </div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </main>
        
        <Navbar />
      </div>
    );
  }
  
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
            <h1 className="text-xl font-semibold flex-1">{movie.title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Share Movie</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>Copy Link</DropdownMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Recommend to Room
                    </DropdownMenuItem>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Recommend Movie</SheetTitle>
                      <SheetDescription>
                        Select a room to recommend "{movie.title}" to:
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <p className="text-center text-muted-foreground py-8">No rooms available</p>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          toast({
                            title: "Creating Room",
                            description: "This feature is coming soon!",
                          });
                        }}
                      >
                        Create a New Room
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="animate-fade-in">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <div 
            className={`absolute inset-0 bg-muted animate-pulse ${isImageLoaded ? 'hidden' : 'block'}`} 
          />
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={`${movie.title} backdrop`}
            className={`w-full h-full object-cover ${isImageLoaded ? 'visible' : 'invisible'}`}
            onLoad={() => setIsImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
        
        <div className="reelmates-container -mt-20 sm:-mt-24 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-28 sm:w-32 md:w-40 flex-shrink-0 shadow-lg rounded-lg overflow-hidden">
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-muted-foreground mt-1 italic">"{movie.tagline}"</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="font-normal">
                  {movie.release_date ? formatDate(movie.release_date) : "Unknown release date"}
                </Badge>
                {movie.runtime > 0 && (
                  <Badge variant="outline" className="font-normal flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
                <Badge 
                  className="bg-accent/10 text-accent border-accent/20 font-normal flex items-center gap-1"
                >
                  ★ {movie.vote_average.toFixed(1)}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {movie.genres.map(genre => (
                  <Badge key={genre.id} variant="secondary" className="font-normal">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {status === "watched" ? (
                  <Button
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20 hover:text-green-700"
                    onClick={handleRemoveFromList}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Watched
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleAddToList("watched")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Watched
                  </Button>
                )}
                
                {status === "to_watch" ? (
                  <Button
                    variant="outline"
                    className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20 hover:text-blue-700"
                    onClick={handleRemoveFromList}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    To Watch
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleAddToList("to_watch")}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    To Watch
                  </Button>
                )}
                
                {status === "favorite" ? (
                  <Button
                    variant="outline"
                    className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20 hover:text-red-700"
                    onClick={handleRemoveFromList}
                  >
                    <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                    Favorite
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleAddToList("favorite")}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favorite
                  </Button>
                )}
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discuss
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Discuss "{movie.title}"</SheetTitle>
                      <SheetDescription>
                        Join a room to discuss this movie with friends
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <p className="text-center text-muted-foreground py-8">You're not in any rooms yet</p>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate("/rooms")}
                      >
                        Find or Create Rooms
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-muted-foreground">{movie.overview}</p>
          </div>
        </div>
      </main>
      
      <Navbar />
    </div>
  );
};

export default MovieDetails;
