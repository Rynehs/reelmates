
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Film, MessageSquare, PlusCircle, Share2, Settings, Edit, BellRing } from "lucide-react";
import type { Room, RoomMember, User } from "@/lib/types";
import AddMovieDialog from "@/components/AddMovieDialog";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";
import RoomMoviesList from "@/components/RoomMoviesList";
import RoomMembersList from "@/components/RoomMembersList";
import RoomChat from "@/components/RoomChat";
import RoomJoinRequests from "@/components/RoomJoinRequests";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("movies");
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [allowMemberMovieAdd, setAllowMemberMovieAdd] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [profileIcon, setProfileIcon] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/");
          return;
        }

        const roomResponse = await supabase
          .from("rooms")
          .select("*")
          .eq("id", id)
          .single();

        if (roomResponse.error) {
          console.error("Error fetching room:", roomResponse.error);
          toast({
            title: "Error",
            description: "Could not load room details. You may not have access to this room.",
            variant: "destructive",
          });
          navigate("/rooms");
          return;
        }

        const roomWithMembers = {
          ...roomResponse.data,
          members: []
        } as Room;
        
        setRoom(roomWithMembers);
        setRoomName(roomWithMembers.name);
        setRoomDescription(roomWithMembers.description || "");
        setProfileIcon(roomWithMembers.profile_icon || "");

        const { data: settingsData, error: settingsError } = await supabase
          .from("room_settings")
          .select("*")
          .eq("room_id", id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error("Error fetching room settings:", settingsError);
          const { data: newSettings } = await supabase
            .from("room_settings")
            .insert({ room_id: id })
            .select()
            .single();
          
          if (newSettings) {
            setAllowMemberMovieAdd(newSettings.allow_member_movie_add);
          }
        } else if (settingsData) {
          setAllowMemberMovieAdd(settingsData.allow_member_movie_add);
        }

        const { data: membersData, error: membersError } = await supabase
          .from("room_members")
          .select(`
            id,
            room_id,
            user_id,
            role,
            joined_at
          `)
          .eq("room_id", id);

        if (membersError) {
          console.error("Error fetching members:", membersError);
          throw membersError;
        }

        const transformedMembers = await Promise.all(
          membersData.map(async (member) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", member.user_id)
              .single();

            let userProfile: User;
            if (profileError) {
              console.error("Error fetching profile for user", member.user_id, profileError);
              userProfile = {
                id: member.user_id,
                name: "Unknown User",
                email: "",
                created_at: ""
              };
            } else {
              userProfile = {
                id: profileData.id,
                name: profileData.username || "Unknown User",
                email: "",
                created_at: "",
                avatar_url: profileData.avatar_url
              };
            }

            return {
              ...member,
              role: member.role as "admin" | "member",
              user: userProfile
            } as RoomMember;
          })
        );

        setMembers(transformedMembers);

        const currentMember = membersData.find(member => member.user_id === session.user.id);
        if (currentMember) {
          setCurrentUserRole(currentMember.role);
          
          // If admin, check for pending join requests
          if (currentMember.role === 'admin') {
            const { data: joinRequests, error: joinRequestsError } = await supabase
              .from('room_join_requests')
              .select('id')
              .eq('room_id', id)
              .eq('status', 'pending');
              
            if (!joinRequestsError) {
              setPendingRequests(joinRequests?.length || 0);
            }
          }
        } else {
          toast({
            title: "Access Denied",
            description: "You are not a member of this room",
            variant: "destructive",
          });
          navigate("/rooms");
        }

      } catch (error) {
        console.error("Error in fetchRoomDetails:", error);
        toast({
          title: "Error",
          description: "Failed to load room details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id, navigate, toast, isRefreshing]);

  const copyInviteCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      toast({
        title: "Invite Code Copied",
        description: "Share this code with friends to join your room",
      });
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(prev => !prev);
  };
  
  const updateRoomInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for the room",
        variant: "destructive",
      });
      return;
    }
    
    if (!room) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: roomName,
          description: roomDescription || null,
          profile_icon: profileIcon || null
        })
        .eq('id', room.id);
        
      if (error) throw error;
      
      toast({
        title: "Room updated",
        description: "Room information has been updated successfully",
      });
      
      setShowEditInfo(false);
      setIsRefreshing(prev => !prev);
    } catch (error: any) {
      console.error("Error updating room:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update room information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canAddMovies = currentUserRole === 'admin' || (currentUserRole === 'member' && allowMemberMovieAdd);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                {room.profile_icon ? (
                  <AvatarImage src={room.profile_icon} alt={room.name} />
                ) : (
                  <AvatarFallback>
                    {room.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{room.name}</h1>
                {room.description && (
                  <p className="text-muted-foreground mt-1">{room.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Created {room ? new Date(room.created_at).toLocaleDateString() : ''}
                </p>
                {currentUserRole === 'admin' && (
                  <div className="mt-2 flex items-center">
                    <div className="bg-muted px-3 py-1 rounded text-sm">
                      Invite Code: <span className="font-mono font-semibold">{room.code}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyInviteCode} 
                      className="ml-2"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {currentUserRole === 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => setShowEditInfo(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {currentUserRole === 'admin' && (
                <>
                  <Button variant="outline" onClick={copyInviteCode}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Room
                  </Button>
                  {pendingRequests > 0 && (
                    <Button variant="outline" onClick={() => setShowJoinRequests(true)}>
                      <BellRing className="mr-2 h-4 w-4" />
                      Join Requests
                      <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                        {pendingRequests}
                      </span>
                    </Button>
                  )}
                </>
              )}
              {canAddMovies && (
                <Button onClick={() => setShowAddMovie(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Movie
                </Button>
              )}
              {currentUserRole === 'admin' && (
                <Button variant="outline" onClick={() => setShowSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="movies" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="movies">
                <Film className="mr-2 h-4 w-4" />
                Movies
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Movies</CardTitle>
                </CardHeader>
                <CardContent>
                  <RoomMoviesList 
                    roomId={room?.id || ''} 
                    isAdmin={currentUserRole === 'admin'}
                    canAddMovies={canAddMovies}
                    onRefresh={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <RoomMembersList
                    roomId={room?.id || ''}
                    isAdmin={currentUserRole === 'admin'}
                    onRefresh={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  {id && <RoomChat roomId={id} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AddMovieDialog 
        roomId={room?.id || ''}
        isOpen={showAddMovie}
        onClose={() => setShowAddMovie(false)}
        onMovieAdded={() => {
          setActiveTab("movies");
          handleRefresh();
        }}
      />

      {currentUserRole === 'admin' && room && (
        <RoomSettingsDialog
          roomId={room.id}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <Dialog open={showEditInfo} onOpenChange={setShowEditInfo}>
        <DialogContent>
          <form onSubmit={updateRoomInfo}>
            <DialogHeader>
              <DialogTitle>Edit Room Information</DialogTitle>
              <DialogDescription>
                Update your room's name, description, and profile icon.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomDescription">Room Description (Optional)</Label>
                <Textarea
                  id="roomDescription"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Describe what this room is about..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profileIcon">Profile Icon URL (Optional)</Label>
                <Input
                  id="profileIcon"
                  value={profileIcon}
                  onChange={(e) => setProfileIcon(e.target.value)}
                  placeholder="Enter image URL for room icon"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL to an image to use as a room icon. Use a square image for best results.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditInfo(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {currentUserRole === 'admin' && id && (
        <RoomJoinRequests
          roomId={id}
          isOpen={showJoinRequests}
          onClose={() => setShowJoinRequests(false)}
          onRequestHandled={handleRefresh}
        />
      )}
    </div>
  );
};

export default RoomDetails;
