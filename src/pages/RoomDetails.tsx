
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Film, MessageSquare, PlusCircle, Share2 } from "lucide-react";
import type { Room, RoomMember, User } from "@/lib/types";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("movies");

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/");
          return;
        }

        // Fetch room details
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", id)
          .single();

        if (roomError) {
          console.error("Error fetching room:", roomError);
          toast({
            title: "Error",
            description: "Could not load room details. You may not have access to this room.",
            variant: "destructive",
          });
          navigate("/rooms");
          return;
        }

        setRoom(roomData as Room);

        // Fetch room members with user details
        const { data: membersData, error: membersError } = await supabase
          .from("room_members")
          .select(`
            id,
            room_id,
            user_id,
            role,
            joined_at,
            profiles:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("room_id", id);

        if (membersError) {
          console.error("Error fetching members:", membersError);
          throw membersError;
        }

        // Transform the data to match the expected types
        const transformedMembers = membersData.map(member => ({
          ...member,
          user: member.profiles as unknown as User
        }));

        setMembers(transformedMembers);

        // Set the current user's role
        const currentMember = membersData.find(member => member.user_id === session.user.id);
        if (currentMember) {
          setCurrentUserRole(currentMember.role);
        } else {
          // User is not a member, redirect to rooms page
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
    return null; // This should never happen due to the redirects above
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Room Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{room.name}</h1>
              <p className="text-sm text-muted-foreground">
                Created {new Date(room.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyInviteCode}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Room
              </Button>
              {currentUserRole === "admin" && (
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Movie
                </Button>
              )}
            </div>
          </div>

          {/* Room Content Tabs */}
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Film className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Movies Yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Movies added to this room will appear here.
                    </p>
                    <Button className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Movie
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <UserAvatar 
                            user={{ 
                              name: member.user?.name || member.user?.email || "Unknown User", 
                              image: member.user?.avatar_url 
                            }} 
                          />
                          <div>
                            <p className="font-medium">{member.user?.name || member.user?.email || "Unknown User"}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                        <div>
                          {currentUserRole === "admin" && member.user_id !== room.created_by && (
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
};

export default RoomDetails;
