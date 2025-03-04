
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchX, Search, Film, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { multiSearch } from "@/lib/tmdb";
import { getImageUrl, getMediaTitle } from "@/lib/tmdb";
import { MediaItem } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import UserAvatar from "@/components/UserAvatar";

interface AddMovieDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onMovieAdded: () => void;
}

interface RoomMember {
  id: string;
  user_id: string;
  role: string;
  user: {
    id: string;
    name: string;
    username?: string;
    avatar_url?: string;
  };
}

const AddMovieDialog = ({ roomId, isOpen, onClose, onMovieAdded }: AddMovieDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState("recommendation");
  const [taggedMemberId, setTaggedMemberId] = useState<string | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && roomId) {
      fetchRoomMembers();
    }
  }, [isOpen, roomId]);

  const fetchRoomMembers = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from("room_members")
        .select("id, user_id, role")
        .eq("room_id", roomId);

      if (membersError) throw membersError;

      // Now fetch profile data for each member
      const enhancedMembers = await Promise.all(
        membersData.map(async (member) => {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", member.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return {
              ...member,
              user: { 
                id: member.user_id, 
                name: "Unknown User" 
              }
            };
          }

          return {
            ...member,
            user: {
              id: profile.id,
              name: profile.username || "Unknown User",
              username: profile.username,
              avatar_url: profile.avatar_url
            }
          };
        })
      );

      setRoomMembers(enhancedMembers);
    } catch (error) {
      console.error("Error fetching room members:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await multiSearch(searchQuery);
      // Filter to only show movies and TV shows
      const filteredResults = results.results.filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );
      setSearchResults(filteredResults as MediaItem[]);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not retrieve search results",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addMediaToRoom = async (media: MediaItem) => {
    setIsAdding(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to add media",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase.from("room_media").insert({
        room_id: roomId,
        media_id: media.id,
        media_type: media.media_type,
        added_by: session.user.id,
        status: 'suggested', // Default status
        title: getMediaTitle(media),
        poster_path: media.poster_path,
        category,
        tagged_member_id: taggedMemberId,
        reactions: {}
      });
      
      if (error) {
        console.error("Error adding media:", error);
        toast({
          title: "Failed to add media",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Media added",
          description: `${getMediaTitle(media)} has been added to the room`,
        });
        onMovieAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "An error occurred",
        description: "Could not add media to room",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Movie or TV Show</DialogTitle>
          <DialogDescription>
            Search for movies or TV shows to add to this room.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-2 my-4">
          <Input
            placeholder="Search movies or TV shows"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <span className="flex items-center">
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
              </span>
            )}
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommendation">Recommendation</SelectItem>
                  <SelectItem value="must_watch">Must Watch</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="new_release">New Release</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tag Room Member (Optional)</label>
              <Select value={taggedMemberId || ""} onValueChange={setTaggedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member to tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {roomMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center">
                        <UserAvatar 
                          user={member.user} 
                          className="h-6 w-6 mr-2" 
                        />
                        {member.user.username || "Unknown User"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <SearchX className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isSearching ? "Searching..." : "No results found. Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((media) => (
                <Card key={`${media.media_type}-${media.id}`} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-16 relative overflow-hidden rounded">
                        {media.poster_path ? (
                          <img 
                            src={getImageUrl(media.poster_path, "w92")} 
                            alt={getMediaTitle(media)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Film className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getMediaTitle(media)}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {media.media_type === 'tv' ? 'TV Show' : 'Movie'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addMediaToRoom(media)}
                      disabled={isAdding}
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovieDialog;
