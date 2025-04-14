import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Plus,
  Search,
  Users,
  Key,
  UserPlus,
  ArrowRightCircle,
  PlusCircle,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/lib/types";
import { RoomInputCodeDialog } from "@/components/RoomInputCodeDialog";

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  return Array(6)
    .fill('')
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');
};

const Rooms = () => {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [memberRooms, setMemberRooms] = useState<Set<string>>(new Set());
  const [adminRooms, setAdminRooms] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      console.log("Fetching rooms...");
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: allRoomsData, error: allRoomsError } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          code,
          created_at,
          created_by,
          description,
          profile_icon
        `)
        .order('created_at', { ascending: false });
      
      if (allRoomsError) {
        console.error("Error fetching all rooms:", allRoomsError);
        throw allRoomsError;
      }
      
      console.log("Fetched all rooms:", allRoomsData?.length || 0);
      
      const roomsWithMembers: Room[] = (allRoomsData || []).map(room => ({
        ...room,
        members: []
      }));
      
      setAllRooms(roomsWithMembers);
      
      if (session?.user) {
        const { data: memberData, error: memberError } = await supabase
          .from('room_members')
          .select('room_id, role')
          .eq('user_id', session.user.id);
        
        if (memberError) {
          console.error("Error fetching member data:", memberError);
        } else {
          const memberRoomIds = new Set(memberData?.map(item => item.room_id) || []);
          setMemberRooms(memberRoomIds);
          
          const adminRoomIds = new Set(
            memberData
              ?.filter(item => item.role === 'admin')
              .map(item => item.room_id) || []
          );
          setAdminRooms(adminRoomIds);
          
          console.log("Found room memberships:", memberRoomIds.size);
          console.log("Found admin rooms:", adminRoomIds.size);
        }
      }
    } catch (error: any) {
      console.error("Error in fetchRooms:", error);
      toast({
        title: "Failed to fetch rooms",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a name for your room",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log("Creating room:", newRoomName);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a room",
          variant: "destructive",
        });
        return;
      }
      
      const roomCode = generateRoomCode();
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: newRoomName,
          description: newRoomDescription.trim() || null,
          created_by: session.user.id,
          code: roomCode,
        })
        .select()
        .single();
      
      if (roomError) {
        console.error("Error creating room:", roomError);
        throw roomError;
      }
      
      console.log("Room created:", room);
      
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          role: 'admin',
        });
      
      if (memberError) {
        console.error("Error adding room member:", memberError);
        throw memberError;
      }
      
      toast({
        title: "Room created",
        description: `Your room "${newRoomName}" has been created`,
      });
      
      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateDialog(false);
      fetchRooms();
    } catch (error: any) {
      console.error("Error in createRoom:", error);
      toast({
        title: "Failed to create room",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to join a room",
          variant: "destructive",
        });
        return;
      }
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('code', roomCode)
        .single();
      
      if (roomError) {
        toast({
          title: "Invalid room code",
          description: "The room code you entered doesn't exist",
          variant: "destructive",
        });
        return;
      }
      
      const { data: existingMembership, error: membershipError } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingMembership) {
        toast({
          title: "Already a member",
          description: "You are already a member of this room",
          variant: "destructive",
        });
        return;
      }
      
      const { error: joinError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          role: 'member',
        });
      
      if (joinError) throw joinError;
      
      toast({
        title: "Room joined",
        description: `You have joined "${room.name}"`,
      });
      
      setRoomCode("");
      setShowJoinDialog(false);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Failed to join room",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const requestToJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomId) {
      return;
    }
    
    setIsRequesting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to request to join a room",
          variant: "destructive",
        });
        return;
      }
      
      const { data: existingRequest } = await supabase
        .from('room_join_requests')
        .select('id, status')
        .eq('room_id', selectedRoomId)
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingRequest) {
        toast({
          title: "Request already pending",
          description: "You already have a pending join request for this room",
        });
        setRequestMessage("");
        setShowRequestDialog(false);
        setSelectedRoomId(null);
        return;
      }
      
      const { error: requestError } = await supabase
        .from('room_join_requests')
        .insert({
          room_id: selectedRoomId,
          user_id: session.user.id,
          message: requestMessage,
          status: 'pending'
        });
      
      if (requestError) throw requestError;
      
      toast({
        title: "Request sent",
        description: `Your request to join "${selectedRoomName}" has been sent`,
      });
      
      setRequestMessage("");
      setShowRequestDialog(false);
      setSelectedRoomId(null);
    } catch (error: any) {
      toast({
        title: "Failed to send request",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };
  
  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Room code copied to clipboard",
    });
  };

  const handleRoomClick = (roomId: string, roomName: string, isMember: boolean) => {
    if (isMember) {
      navigate(`/room/${roomId}`);
    } else {
      setSelectedRoomId(roomId);
      setSelectedRoomName(roomName);
      setShowRequestDialog(true);
    }
  };

  const JoinRoomDialog = ({ isOpen, onClose, roomId, roomName }: { isOpen: boolean; onClose: () => void; roomId: string; roomName: string }) => {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please login to request joining a room",
            variant: "destructive",
          });
          return;
        }

        const { data: existingMember } = await supabase
          .from("room_members")
          .select("id")
          .eq("room_id", roomId)
          .eq("user_id", session.user.id)
          .single();

        if (existingMember) {
          toast({
            title: "Already a Member",
            description: "You are already a member of this room",
          });
          onClose();
          return;
        }

        const { data: existingRequest } = await supabase
          .from("room_join_requests")
          .select("id, status")
          .eq("room_id", roomId)
          .eq("user_id", session.user.id)
          .eq("status", "pending")
          .single();

        if (existingRequest) {
          toast({
            title: "Request Pending",
            description: "You already have a pending request to join this room",
          });
          onClose();
          return;
        }

        const { error } = await supabase
          .from("room_join_requests")
          .insert({
            room_id: roomId,
            user_id: session.user.id,
            message: message.trim() || null,
          });

        if (error) throw error;

        const { data: adminMembers } = await supabase
          .from("room_members")
          .select("user_id")
          .eq("room_id", roomId)
          .eq("role", "admin");

        if (adminMembers && adminMembers.length > 0) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();

          const username = userProfile?.username || session.user.email || "Someone";

          await Promise.all(
            adminMembers.map(admin => 
              supabase
                .from("notifications")
                .insert({
                  user_id: admin.user_id,
                  title: "New Join Request",
                  message: `${username} has requested to join your room "${roomName}"`,
                  type: "room",
                  entity_id: roomId
                })
            )
          );
        }

        toast({
          title: "Request Sent",
          description: "Your request to join the room has been sent to the room admins",
        });

        onClose();
      } catch (error) {
        console.error("Error submitting join request:", error);
        toast({
          title: "Error",
          description: "Failed to submit join request",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request to Join {roomName}</DialogTitle>
            <DialogDescription>
              Send a request to the room admins to join this room. You can include a message with your request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Why do you want to join this room?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const RoomCard = ({ room, onJoin, onView, isAdmin, isMember }: { 
    room: Room; 
    onJoin: () => void; 
    onView: () => void; 
    isAdmin: boolean;
    isMember: boolean;
  }) => {
    const [showJoinRequest, setShowJoinRequest] = useState(false);
    
    return (
      <>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  {room.profile_icon ? (
                    <AvatarImage src={room.profile_icon} alt={room.name} />
                  ) : (
                    <AvatarFallback>
                      {room.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{room.name}</CardTitle>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {room.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {room.description}
              </p>
            )}
            
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Created {new Date(room.created_at).toLocaleDateString()}
              </p>
              {room.members && (
                <p className="text-sm text-muted-foreground">
                  <Users className="inline h-4 w-4 mr-1" /> 
                  {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              {isMember ? (
                <Button size="sm" onClick={onView}>
                  View Room
                </Button>
              ) : isAdmin ? (
                <>
                  <Button size="sm" variant="outline" onClick={onJoin}>
                    <Key className="mr-2 h-4 w-4" />
                    {room.code}
                  </Button>
                  <Button size="sm" onClick={onView}>
                    View Room
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setShowJoinRequest(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request to Join
                  </Button>
                  <Button size="sm" onClick={() => setShowCodeDialog(true)}>
                    Join with Code
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <JoinRoomDialog 
          isOpen={showJoinRequest} 
          onClose={() => setShowJoinRequest(false)} 
          roomId={room.id} 
          roomName={room.name} 
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Movie Rooms</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCodeDialog(true)}>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Join Room
              </Button>
              
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Room
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : allRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRooms.map((room) => {
                const isMember = memberRooms.has(room.id);
                const isAdmin = adminRooms.has(room.id);
                return (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onJoin={() => handleRoomClick(room.id, room.name, isMember)}
                    onView={() => navigate(`/room/${room.id}`)}
                    isAdmin={isAdmin}
                    isMember={isMember}
                  />
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No Rooms Yet</h3>
                  <p className="text-muted-foreground">
                    Create a room to share and discuss movies with friends, or join an existing room.
                  </p>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCodeDialog(true)}>
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    Join Room
                  </Button>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <form onSubmit={requestToJoin}>
            <DialogHeader>
              <DialogTitle>Request to Join Room</DialogTitle>
              <DialogDescription>
                Your request will be sent to the room admins for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestMessage">Message (Optional)</Label>
                <Textarea
                  id="requestMessage"
                  placeholder="Tell the admins why you'd like to join..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestDialog(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isRequesting}>
                {isRequesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <RoomInputCodeDialog 
        isOpen={showCodeDialog}
        onClose={() => setShowCodeDialog(false)}
      />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <form onSubmit={createRoom}>
            <DialogHeader>
              <DialogTitle>Create a Movie Room</DialogTitle>
              <DialogDescription>
                Create a room to share and discuss movies with friends.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g. Movie Night Club"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomDescription">Room Description (Optional)</Label>
                <Textarea
                  id="roomDescription"
                  placeholder="Describe your movie room..."
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rooms;
