
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ThumbsUp, 
  Eye, 
  Trash2, 
  Film, 
  PlusCircle, 
  Tag, 
  Heart, 
  ThumbsDown, 
  Smile, 
  Zap 
} from "lucide-react";
import { RoomMedia } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import AddMovieDialog from "@/components/AddMovieDialog";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  taggedUser?: UserProfile;
  reactions?: {
    [key: string]: string[];
  };
  category?: string;
  tagged_member_id?: string | null;
}

const REACTION_EMOJIS = {
  thumbsup: <ThumbsUp className="h-4 w-4" />,
  thumbsdown: <ThumbsDown className="h-4 w-4" />,
  heart: <Heart className="h-4 w-4" />,
  smile: <Smile className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />
};

const CATEGORY_BADGES = {
  recommendation: { label: "Recommendation", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  must_watch: { label: "Must Watch", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  classic: { label: "Classic", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  new_release: { label: "New Release", className: "bg-green-500/10 text-green-600 border-green-200" }
};

const RoomMoviesList = ({ roomId, isAdmin, onRefresh, canAddMovies = false }: RoomMoviesListProps) => {
  const [media, setMedia] = useState<RoomMediaWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMediaIds, setLoadingMediaIds] = useState<Set<string>>(new Set());
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [submittingReaction, setSubmittingReaction] = useState<{id: string, emoji: string} | null>(null);
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
          // Fetch the user who added the media
          const { data: adderProfileData, error: adderProfileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", item.added_by)
            .single();

          let userProfile: UserProfile | undefined;
          if (!adderProfileError) {
            userProfile = adderProfileData;
          }

          // Fetch the tagged user if there is one
          let taggedUserProfile: UserProfile | undefined;
          if (item.tagged_member_id) {
            const { data: taggedProfileData, error: taggedProfileError } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", item.tagged_member_id)
              .single();

            if (!taggedProfileError) {
              taggedUserProfile = taggedProfileData;
            }
          }

          return {
            ...item,
            title: item.title || `${item.media_type === 'movie' ? 'Movie' : 'TV Show'} #${item.media_id}`,
            poster_path: item.poster_path,
            user: userProfile,
            taggedUser: taggedUserProfile,
            reactions: item.reactions || {}
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

  const handleReaction = async (mediaId: string, emoji: string) => {
    try {
      setSubmittingReaction({id: mediaId, emoji});
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to react",
          variant: "destructive",
        });
        return;
      }
      
      const userId = session.user.id;
      
      // First, get the current reactions
      const { data, error } = await supabase
        .from("room_media")
        .select('reactions')
        .eq("id", mediaId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the reactions object
      const currentReactions = data.reactions || {};
      
      // If the emoji key doesn't exist yet, create it
      if (!currentReactions[emoji]) {
        currentReactions[emoji] = [];
      }
      
      // Check if the user has already reacted with this emoji
      const userIndex = currentReactions[emoji].indexOf(userId);
      
      if (userIndex === -1) {
        // User hasn't reacted with this emoji, add them
        currentReactions[emoji].push(userId);
      } else {
        // User has already reacted with this emoji, remove them (toggle)
        currentReactions[emoji] = currentReactions[emoji].filter((id: string) => id !== userId);
        
        // If no users left for this emoji, clean up the empty array
        if (currentReactions[emoji].length === 0) {
          delete currentReactions[emoji];
        }
      }
      
      // Update the media record with the new reactions
      const { error: updateError } = await supabase
        .from("room_media")
        .update({ reactions: currentReactions })
        .eq("id", mediaId);

      if (updateError) {
        throw updateError;
      }

      fetchRoomMedia();
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    } finally {
      setSubmittingReaction(null);
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

  const getReactionCounts = (reactions: {[key: string]: string[]}) => {
    const counts: {[key: string]: number} = {};
    
    Object.keys(reactions).forEach(emoji => {
      counts[emoji] = reactions[emoji].length;
    });
    
    return counts;
  };

  const hasUserReacted = (reactions: {[key: string]: string[]}, emoji: string, userId: string) => {
    return reactions[emoji] && reactions[emoji].includes(userId);
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const categoryInfo = CATEGORY_BADGES[category as keyof typeof CATEGORY_BADGES] || 
      { label: category, className: "bg-gray-500/10 text-gray-600 border-gray-200" };
    
    return (
      <Badge className={categoryInfo.className}>
        {categoryInfo.label}
      </Badge>
    );
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
                      <div className="flex flex-col space-y-1">
                        <h3 className="text-lg font-semibold">
                          {item.title || `${item.media_type === 'movie' ? 'Movie' : 'TV Show'} #${item.media_id}`}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary-foreground capitalize">
                            {item.status}
                          </span>
                          {item.category && (
                            <CategoryBadge category={item.category} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{item.media_type}</span>
                      {item.votes !== undefined && item.votes > 0 && (
                        <span className="ml-2 flex items-center">
                          • <ThumbsUp className="ml-1 mr-1 h-3.5 w-3.5" /> {item.votes}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {item.user && (
                        <div className="flex items-center">
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
                      
                      {item.taggedUser && (
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div className="ml-2 flex items-center">
                            <UserAvatar 
                              user={{ 
                                name: item.taggedUser.username || "Unknown", 
                                avatar_url: item.taggedUser.avatar_url 
                              }} 
                              className="h-5 w-5 mr-1"
                            />
                            <span className="text-xs">
                              Recommended for {item.taggedUser.username || "Unknown"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
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
                    
                    <TooltipProvider>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Smile className="mr-2 h-3 w-3" />
                            React
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                          <div className="flex gap-2">
                            {Object.entries(REACTION_EMOJIS).map(([key, icon]) => {
                              // Get the user ID to check if they've already reacted
                              let userId = '';
                              supabase.auth.getSession().then(({ data }) => {
                                if (data.session) userId = data.session.user.id;
                              });
                              
                              const reactionCount = item.reactions && item.reactions[key] ? item.reactions[key].length : 0;
                              const hasReacted = userId && item.reactions && item.reactions[key] ? item.reactions[key].includes(userId) : false;
                              
                              return (
                                <Tooltip key={key}>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant={hasReacted ? "default" : "outline"} 
                                      size="icon" 
                                      className="h-8 w-8 relative"
                                      onClick={() => handleReaction(item.id, key)}
                                      disabled={submittingReaction && submittingReaction.id === item.id}
                                    >
                                      {icon}
                                      {reactionCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
                                          {reactionCount}
                                        </span>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {key}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TooltipProvider>
                    
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
                  
                  {/* Display reactions */}
                  {item.reactions && Object.keys(item.reactions).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.entries(item.reactions).map(([emoji, users]) => (
                        users.length > 0 && (
                          <Tooltip key={emoji}>
                            <TooltipTrigger asChild>
                              <div className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-muted">
                                {REACTION_EMOJIS[emoji as keyof typeof REACTION_EMOJIS]}
                                <span className="ml-1">{users.length}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {users.length} {users.length === 1 ? 'person' : 'people'} reacted with {emoji}
                            </TooltipContent>
                          </Tooltip>
                        )
                      ))}
                    </div>
                  )}
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
