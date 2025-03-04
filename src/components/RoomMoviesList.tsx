import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ThumbsUp, Eye, Trash2, Film, PlusCircle } from "lucide-react";
import { RoomMedia } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import AddMovieDialog from "@/components/AddMovieDialog";
import { Link } from "react-router-dom";

interface RoomMoviesListProps {
  roomId: string;
  isAdmin: boolean;
  onRefresh: () => void;
  canAddMovies?: boolean;
}

// Define a simpler interface for user profiles from Supabase
interface UserProfile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
}

// Create a new interface for the room media with user information
interface RoomMediaWithProfile extends Omit<RoomMedia, 'user'> {
  user?: UserProfile;
}

const RoomMoviesList = ({ roomId, isAdmin, onRefresh, canAddMovies = false }: RoomMoviesListProps) => {
  const [media, setMedia] = useState<RoomMediaWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMediaIds, setLoadingMediaIds] = useState<Set<string>>(new Set());
  const [showAddMovie, setShowAddMovie] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoomMedia();
  }, [roomId]);

  const fetchRoomMedia = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("room_media")
        .select(`*`)
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const enhancedMedia = await Promise.all(
        data.map(async (item: any) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", item.added_by)
            .single();

          let userProfile: UserProfile | undefined;
          
          if (!profileError) {
            userProfile = profileData;
          }

          return {
            ...item,
            title: item.title || `${item.media_type === 'movie' ? 'Movie' : 'TV Show'} #${item.media_id}`,
            poster_path: item.poster_path,
            user: userProfile
          };
        })
      );

      setMedia(enhancedMedia as RoomMediaWithProfile[]);
    } catch (error) {
      console.error("Error fetching room media:", error);
      toast({
        title: "Error",
        description: "Failed to load room media",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (mediaId: string) => {
    try {
      setLoadingMediaIds(prev => new Set(prev).add(mediaId));
      
      const { data, error } = await supabase
        .from("room_media")
        .select('votes')
        .eq("id", mediaId)
        .single();
      
      if (error) {
        throw error;
      }
      
      const currentVotes = data.votes || 0;
      const newVotes = currentVotes + 1;
      
      const { error: updateError } = await supabase
        .from("room_media")
        .update({ votes: newVotes })
        .eq("id", mediaId);

      if (updateError) {
        throw updateError;
      }

      fetchRoomMedia();
      toast({
        title: "Vote cast",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error("Error voting for media:", error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive",
      });
    } finally {
      setLoadingMediaIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleMarkAsWatched = async (mediaId: string) => {
    try {
      setLoadingMediaIds(prev => new Set(prev).add(mediaId));
      
      const { error } = await supabase
        .from("room_media")
        .update({ status: 'watched' })
        .eq("id", mediaId);

      if (error) {
        throw error;
      }

      fetchRoomMedia();
      toast({
        title: "Marked as watched",
        description: "This item has been marked as watched",
      });
    } catch (error) {
      console.error("Error marking media as watched:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoadingMediaIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to remove this item from the room?")) {
      return;
    }
    
    try {
      setLoadingMediaIds(prev => new Set(prev).add(mediaId));
      
      const { error } = await supabase
        .from("room_media")
        .delete()
        .eq("id", mediaId);

      if (error) {
        throw error;
      }

      fetchRoomMedia();
      toast({
        title: "Item removed",
        description: "The item has been removed from the room",
      });
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setLoadingMediaIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canAddMovies && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowAddMovie(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Movie
          </Button>
        </div>
      )}
      
      {media.length === 0 ? (
        <div className="text-center py-8">
          <Film className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No movies or shows added yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add some movies or TV shows to get started
          </p>
        </div>
      ) : (
        media.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-auto sm:flex-shrink-0">
                  {item.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={item.title || `${item.media_type} ${item.media_id}`}
                      className="w-full sm:w-32 h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full sm:w-32 h-48 bg-muted flex items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">
                        {item.title || `${item.media_type === 'movie' ? 'Movie' : 'TV Show'} #${item.media_id}`}
                      </h3>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary-foreground capitalize">
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{item.media_type}</span>
                      {item.votes !== undefined && item.votes > 0 && (
                        <span className="ml-2 flex items-center">
                          • <ThumbsUp className="ml-1 mr-1 h-3.5 w-3.5" /> {item.votes}
                        </span>
                      )}
                    </div>
                    
                    {item.user && (
                      <div className="mt-3 flex items-center">
                        <UserAvatar 
                          user={{ 
                            name: item.user.username || "Unknown", 
                            avatar_url: item.user.avatar_url 
                          }} 
                          className="h-6 w-6"
                        />
                        <Link to={`/user/${item.user.id}`} className="ml-2 text-xs hover:underline hover:text-primary">
                          Added by {item.user.username || "Unknown"}
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.status !== 'watched' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVote(item.id)}
                          disabled={loadingMediaIds.has(item.id)}
                        >
                          {loadingMediaIds.has(item.id) ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <ThumbsUp className="mr-2 h-3 w-3" />
                          )}
                          Vote
                        </Button>
                        
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkAsWatched(item.id)}
                            disabled={loadingMediaIds.has(item.id)}
                          >
                            {loadingMediaIds.has(item.id) ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="mr-2 h-3 w-3" />
                            )}
                            Mark Watched
                          </Button>
                        )}
                      </>
                    )}
                    
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                        disabled={loadingMediaIds.has(item.id)}
                      >
                        {loadingMediaIds.has(item.id) ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-3 w-3" />
                        )}
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AddMovieDialog 
        roomId={roomId}
        isOpen={showAddMovie}
        onClose={() => setShowAddMovie(false)}
        onMovieAdded={() => {
          fetchRoomMedia();
          onRefresh();
        }}
      />
    </div>
  );
};

export default RoomMoviesList;
