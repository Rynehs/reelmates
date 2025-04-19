import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Movie, TVShow, MediaItem } from "@/lib/types";
import { getImageUrl, getMediaTitle, getMediaReleaseDate } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  Loader2,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  media: Movie | TVShow | MediaItem;
  status?: "watched" | "to_watch" | "favorite" | undefined;
  onClick?: () => void;
  showActions?: boolean;
}

const MovieCard = ({ media, status, onClick, showActions = false }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const title = getMediaTitle(media);
  const releaseDate = getMediaReleaseDate(media);
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown";
  const mediaType = media.media_type || 'movie';
  
  // Format rating to one decimal place
  const rating = media.vote_average ? media.vote_average.toFixed(1) : "?";
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const addToList = async (newStatus: "to_watch" | "watched" | "favorite") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add media to your list",
          variant: "destructive",
        });
        return;
      }
      
      setIsAddingToList(true);
      
      // First, check if the media is already in the user's list
      const { data: existingMedia, error: fetchError } = await supabase
        .from("user_movies")
        .select("id, status")
        .eq("user_id", session.user.id)
        .eq("movie_id", media.id)
        .eq("media_type", mediaType)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (existingMedia) {
        // If the media already exists and the new status is the same as the current status,
        // we should remove it (toggle behavior)
        if (existingMedia.status === newStatus) {
          result = await supabase
            .from("user_movies")
            .delete()
            .eq("id", existingMedia.id);
          
          toast({
            title: `Removed from ${newStatus.replace("_", " ")}`,
            description: `"${title}" has been removed from your ${newStatus.replace("_", " ")} list`,
          });
        } else {
          // Otherwise, update the status
          result = await supabase
            .from("user_movies")
            .update({ status: newStatus })
            .eq("id", existingMedia.id);
          
          toast({
            title: `Status updated`,
            description: `"${title}" has been moved to your ${newStatus.replace("_", " ")} list`,
          });
        }
      } else {
        // If the media doesn't exist, insert a new record
        result = await supabase.from("user_movies").insert({
          user_id: session.user.id,
          movie_id: media.id,
          media_type: mediaType,
          status: newStatus,
        });
        
        toast({
          title: `${mediaType === 'movie' ? 'Movie' : 'TV Show'} added`,
          description: `"${title}" has been added to your ${newStatus.replace("_", " ")} list`,
        });
      }
      
      if (result.error) throw result.error;
      
    } catch (error: any) {
      toast({
        title: `Failed to update ${mediaType === 'movie' ? 'movie' : 'TV show'}`,
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAddingToList(false);
    }
  };
  
  return (
    <div 
      className="movie-card h-full flex flex-col"
      onClick={handleClick}
    >
      <Link to={`/${media.media_type}/${media.id}`} className="block flex-grow">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
          <div 
            className={`absolute inset-0 bg-muted animate-pulse ${imageLoaded ? 'hidden' : 'block'}`} 
          />
          <img
            src={getImageUrl(media.poster_path)}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
          
          {status && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`${
                  status === 'watched' 
                    ? 'bg-green-500/10 text-green-600 border-green-200' 
                    : status === 'favorite' 
                    ? 'bg-red-500/10 text-red-600 border-red-200' 
                    : 'bg-blue-500/10 text-blue-600 border-blue-200'
                }`}
              >
                {status === 'watched' 
                  ? 'Watched' 
                  : status === 'favorite' 
                  ? 'Favorite' 
                  : 'Watch Later'}
              </Badge>
            </div>
          )}
          
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/75 text-white border-none">
              {mediaType === 'tv' ? 'TV' : 'Movie'}
            </Badge>
          </div>
          
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center bg-black/75 text-white text-xs font-medium py-0.5 px-2 rounded-full">
              <Star className="w-3 h-3 mr-1 text-yellow-400" />
              {rating}
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{year}</p>
        </div>
      </Link>
      
      {showActions && (
        <div className="p-3 pt-0 mt-auto grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-2 w-full" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToList("to_watch");
            }}
            disabled={isAddingToList}
          >
            {isAddingToList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
            <span className="ml-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">Later</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 px-2 w-full" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToList("watched");
            }}
            disabled={isAddingToList}
          >
            {isAddingToList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            <span className="ml-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">Watched</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 px-2 w-full" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToList("favorite");
            }}
            disabled={isAddingToList}
          >
            {isAddingToList ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5" />}
            <span className="ml-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">Favorite</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
