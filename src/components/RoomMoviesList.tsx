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
  Zap,
  Filter 
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { classNames } from "@/lib/utils";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'votes' | 'newest'>('votes');
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>('recommendation');
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    checkAuth();
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
            reactions: item.reactions || {},
            category: item.category || 'recommendation'
          };
        })
      );

      // Sort the media based on sortOrder
      let sortedMedia = [...enhancedMedia] as RoomMediaWithProfile[];
      if (sortOrder === 'votes') {
        sortedMedia.sort((a, b) => {
          const votesA = a.votes || 0;
          const votesB = b.votes || 0;
          return votesB - votesA;
        });
      }

      setMedia(sortedMedia);
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

  const handleChangeCategory = async (mediaId: string, category: string) => {
    try {
      setLoadingMediaIds(prev => new Set(prev).add(mediaId));
      
      const { error } = await supabase
        .from("room_media")
        .update({ category })
        .eq("id", mediaId);

      if (error) {
        throw error;
      }

      fetchRoomMedia();
      setEditingMediaId(null);
      toast({
        title: "Category updated",
        description: "The media category has been updated",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
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

  const handleVote = async (mediaId: string, voteType: 'up' | 'down') => {
    try {
      setLoadingMediaIds(prev => new Set(prev).add(mediaId));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to vote",
          variant: "destructive",
        });
        return;
      }
      
      const { data: mediaData, error: fetchError } = await supabase
        .from("room_media")
        .select('votes, reactions')
        .eq("id", mediaId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentVotes = mediaData.votes || 0;
      const currentReactions = mediaData.reactions || {};
      const userId = session.user.id;
      
      // Check if user has already voted
      const hasUpvoted = currentReactions.upvote?.includes(userId);
      const hasDownvoted = currentReactions.downvote?.includes(userId);
      
      let newVotes = currentVotes;
      let newReactions = { ...currentReactions };
      
      if (voteType === 'up') {
        if (hasUpvoted) {
          // Remove upvote
          newVotes--;
          newReactions.upvote = newReactions.upvote.filter((id: string) => id !== userId);
        } else {
          // Add upvote
          newVotes++;
          if (!newReactions.upvote) newReactions.upvote = [];
          newReactions.upvote.push(userId);
          
          // Remove downvote if exists
          if (hasDownvoted) {
            newVotes++;
            newReactions.downvote = newReactions.downvote.filter((id: string) => id !== userId);
          }
        }
      } else {
        if (hasDownvoted) {
          // Remove downvote
          newVotes++;
          newReactions.downvote = newReactions.downvote.filter((id: string) => id !== userId);
        } else {
          // Add downvote
          newVotes--;
          if (!newReactions.downvote) newReactions.downvote = [];
          newReactions.downvote.push(userId);
          
          // Remove upvote if exists
          if (hasUpvoted) {
            newVotes--;
            newReactions.upvote = newReactions.upvote.filter((id: string) => id !== userId);
          }
        }
      }
      
      const { error: updateError } = await supabase
        .from("room_media")
        .update({ 
          votes: newVotes,
          reactions: newReactions
        })
        .eq("id", mediaId);

      if (updateError) throw updateError;

      fetchRoomMedia();
      toast({
        title: "Vote recorded",
        description: `Your ${voteType}vote has been recorded`,
      });
    } catch (error: any) {
      console.error("Error voting for media:", error);
      toast({
        title: "Error",
        description: "Failed to record vote",
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

  const isUserReacted = (reactions: {[key: string]: string[]}, emoji: string) => {
    if (!currentUserId || !reactions || !reactions[emoji]) return false;
    return reactions[emoji].includes(currentUserId);
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

  const filteredMedia = categoryFilter 
    ? media.filter(item => item.category === categoryFilter) 
    : media;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                <Filter className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
                Filter & Sort
                {categoryFilter && <Badge className="ml-2 bg-primary/20">{CATEGORY_BADGES[categoryFilter as keyof typeof CATEGORY_BADGES]?.label || categoryFilter}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter by Category</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      className={`cursor-pointer ${!categoryFilter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                      onClick={() => setCategoryFilter(null)}
                    >
                      All
                    </Badge>
                    {Object.entries(CATEGORY_BADGES).map(([key, { label, className }]) => (
                      <Badge 
                        key={key}
                        className={`cursor-pointer ${categoryFilter === key ? 'bg-primary text-primary-foreground' : className}`}
                        onClick={() => setCategoryFilter(key)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Sort by</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={sortOrder === 'votes' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => {
                        setSortOrder('votes');
                        fetchRoomMedia();
                      }}
                    >
                      Most Votes
                    </Button>
                    <Button 
                      variant={sortOrder === 'newest' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => {
                        setSortOrder('newest');
                        fetchRoomMedia();
                      }}
                    >
                      Newest First
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {canAddMovies && (
          <Button onClick={() => setShowAddMovie(true)} size={isMobile ? "sm" : "default"}>
            <PlusCircle className={`${isMobile ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
            Add Movie
          </Button>
        )}
      </div>
      
      {filteredMedia.length === 0 ? (
        <div className="text-center py-8">
          <Film className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No movies or shows added yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add some movies or TV shows to get started
          </p>
        </div>
      ) : (
        filteredMedia.map((item) => (
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
                            <div className="flex items-center gap-1">
                              {editingMediaId === item.id ? (
                                <Select 
                                  value={editingCategory} 
                                  onValueChange={(value) => setEditingCategory(value)}
                                >
                                  <SelectTrigger className="h-7 w-[140px]">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>Categories</SelectLabel>
                                      {Object.entries(CATEGORY_BADGES).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <CategoryBadge category={item.category} />
                              )}
                              
                              {isAdmin && (
                                editingMediaId === item.id ? (
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6"
                                      onClick={() => handleChangeCategory(item.id, editingCategory)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                      </svg>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6"
                                      onClick={() => setEditingMediaId(null)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                      </svg>
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setEditingMediaId(item.id);
                                      setEditingCategory(item.category || 'recommendation');
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                    </svg>
                                  </Button>
                                )
                              )}
                            </div>
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
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVote(item.id, 'up')}
                          disabled={loadingMediaIds.has(item.id)}
                          className={classNames({
                            'bg-primary/10': item.reactions?.upvote?.includes(currentUserId || '')
                          })}
                        >
                          {loadingMediaIds.has(item.id) ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <ThumbsUp className="mr-2 h-3 w-3" />
                          )}
                          Upvote
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVote(item.id, 'down')}
                          disabled={loadingMediaIds.has(item.id)}
                          className={classNames({
                            'bg-destructive/10': item.reactions?.downvote?.includes(currentUserId || '')
                          })}
                        >
                          {loadingMediaIds.has(item.id) ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <ThumbsDown className="mr-2 h-3 w-3" />
                          )}
                          Downvote
                        </Button>
                      </div>
                    )}
                    
                    {/* Enhanced React Button Section - All users can react */}
                    <div className="flex gap-2">
                      {Object.entries(REACTION_EMOJIS).map(([emoji, icon]) => {
                        const hasReacted = isUserReacted(item.reactions || {}, emoji);
                        const count = item.reactions && item.reactions[emoji] ? item.reactions[emoji].length : 0;

                        return (
                          <TooltipProvider key={emoji}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant={hasReacted ? "default" : "outline"} 
                                  size="sm"
                                  className="relative"
                                  onClick={() => handleReaction(item.id, emoji)}
                                  disabled={submittingReaction && submittingReaction.id === item.id}
                                >
                                  {submittingReaction && submittingReaction.id === item.id && submittingReaction.emoji === emoji ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  ) : (
                                    <span className="mr-1">{icon}</span>
                                  )}
                                  {count > 0 && <span>{count}</span>}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {hasReacted ? `Remove your ${emoji} reaction` : `React with ${emoji}`}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                    
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
