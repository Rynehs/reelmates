
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoomMedia } from "@/lib/types";
import { getImageUrl } from "@/lib/tmdb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface RoomMoviesListProps {
  roomId: string;
  isAdmin: boolean;
  onRefresh: () => void;
}

const RoomMoviesList = ({ roomId, isAdmin, onRefresh }: RoomMoviesListProps) => {
  const [movies, setMovies] = useState<RoomMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchRoomMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("room_media")
          .select(`
            *,
            user:added_by (
              id,
              username,
              avatar_url
            )
          `)
          .eq("room_id", roomId)
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Fetch media details from TMDB
        if (data && data.length > 0) {
          // Transform the data to match RoomMedia type
          const roomMedia = data.map(item => ({
            ...item,
            user: item.user
          })) as RoomMedia[];
          
          setMovies(roomMedia);
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error("Error fetching room movies:", err);
        setError("Failed to load room media. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchRoomMovies();
    }
  }, [roomId]);

  const handleStatusChange = async (media: RoomMedia, newStatus: 'suggested' | 'approved' | 'watched') => {
    try {
      const { error } = await supabase
        .from("room_media")
        .update({ status: newStatus })
        .eq("id", media.id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setMovies(prevMovies => 
        prevMovies.map(m => m.id === media.id ? { ...m, status: newStatus } : m)
      );
      
      toast({
        title: "Status updated",
        description: `Media status updated to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating media status:", err);
      toast({
        title: "Error",
        description: "Failed to update media status",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (media: RoomMedia, increment: number) => {
    try {
      const newVotes = (media.votes || 0) + increment;
      
      const { error } = await supabase
        .from("room_media")
        .update({ votes: newVotes })
        .eq("id", media.id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setMovies(prevMovies => 
        prevMovies.map(m => m.id === media.id ? { ...m, votes: newVotes } : m)
      );
    } catch (err) {
      console.error("Error updating votes:", err);
      toast({
        title: "Error",
        description: "Failed to update vote",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from("room_media")
        .delete()
        .eq("id", mediaId);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setMovies(prevMovies => prevMovies.filter(m => m.id !== mediaId));
      
      toast({
        title: "Media removed",
        description: "The media has been removed from the room",
      });
      
      onRefresh();
    } catch (err) {
      console.error("Error removing media:", err);
      toast({
        title: "Error",
        description: "Failed to remove media",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Film className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Movies Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Movies added to this room will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {movies.map((media) => (
        <Card key={media.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-24 h-36 flex-shrink-0">
                {media.poster_path ? (
                  <img 
                    src={getImageUrl(media.poster_path)} 
                    alt={media.title || "Movie poster"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{media.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Added by {media.user?.username || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      Status: {media.status}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleVote(media, -1)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{media.votes || 0}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleVote(media, 1)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isAdmin && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveMedia(media.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                {isAdmin && media.status === 'suggested' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(media, 'approved')}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RoomMoviesList;
