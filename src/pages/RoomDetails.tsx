import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Film, MessageSquare, PlusCircle, Share2, Settings } from "lucide-react";
import type { Room, RoomMember, User } from "@/lib/types";
import AddMovieDialog from "@/components/AddMovieDialog";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";
import RoomMoviesList from "@/components/RoomMoviesList";
import RoomMembersList from "@/components/RoomMembersList";

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
  const [allowMemberMovieAdd, setAllowMemberMovieAdd] = useState(true);

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
  }, [id, navigate, toast]);

  const copyInviteCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      toast({
        title: "Invite Code Copied",
        description: "Share this code with friends to join your room",
      });
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
            <div>
              <h1 className="text-2xl font-bold">{room?.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {room ? new Date(room.created_at).toLocaleDateString() : ''}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyInviteCode}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Room
              </Button>
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
                    onRefresh={() => {
                      // Refresh logic if needed
                    }}
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
                    onRefresh={() => {
                      // Refresh logic if needed
                    }}
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Chat Coming Soon</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Chat functionality will be available in a future update.
                    </p>
                  </div>
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
          // Refresh logic if needed
        }}
      />

      {currentUserRole === 'admin' && room && (
        <RoomSettingsDialog
          roomId={room.id}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default RoomDetails;
