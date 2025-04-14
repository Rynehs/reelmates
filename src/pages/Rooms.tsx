
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Users, Copy, ArrowRightCircle, Loader2, Info, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Room {
  id: string;
  name: string;
  code: string;
  created_at: string;
  created_by: string;
  description?: string;
  profile_icon?: string;
}

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
      
      // First, fetch all rooms (now visible to everyone)
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
      setAllRooms(allRoomsData || []);
      
      // If user is logged in, fetch which rooms they're a member of
      if (session?.user) {
        const { data: memberData, error: memberError } = await supabase
          .from('room_members')
          .select('room_id, role')
          .eq('user_id', session.user.id);
        
        if (memberError) {
          console.error("Error fetching member data:", memberError);
        } else {
          // Create a set of room IDs that the user is a member of
          const memberRoomIds = new Set(memberData?.map(item => item.room_id) || []);
          setMemberRooms(memberRoomIds);
          
          // Create a set of room IDs where the user is an admin
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
      
      // Check if user already has a pending request
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
      // If already a member, navigate to the room
      navigate(`/room/${roomId}`);
    } else {
      // If not a member, open the request dialog
      setSelectedRoomId(roomId);
      setSelectedRoomName(roomName);
      setShowRequestDialog(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Movie Rooms</h1>
            <div className="flex space-x-2">
              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    Join Room
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={joinRoom}>
                    <DialogHeader>
                      <DialogTitle>Join a Room</DialogTitle>
                      <DialogDescription>
                        Enter the room code to join an existing movie room.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="roomCode">Room Code</Label>
                        <Input
                          id="roomCode"
                          placeholder="Enter 6-digit code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isJoining}>
                        {isJoining ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRightCircle className="mr-2 h-4 w-4" />
                        )}
                        Join Room
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Room
                  </Button>
                </DialogTrigger>
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
                  <Card key={room.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
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
                          <CardTitle>{room.name}</CardTitle>
                          <CardDescription>
                            Created {new Date(room.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {room.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      
                      {isMember && isAdmin && (
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                            Room Code: <span className="font-mono">{room.code}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyRoomCode(room.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <div className="mt-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isMember ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                          {isMember ? (isAdmin ? 'Admin' : 'Member') : 'Not Joined'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={isMember ? "default" : "outline"}
                        onClick={() => handleRoomClick(room.id, room.name, isMember)}
                      >
                        {isMember ? (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            View Room
                          </>
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Request to Join
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
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
                  <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
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
    </div>
  );
};

export default Rooms;
