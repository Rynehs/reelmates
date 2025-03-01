
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Users, Copy, ArrowRightCircle, Loader2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  code: string;
  created_at: string;
  created_by: string;
}

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  return Array(6)
    .fill('')
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');
};

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    // Subscribe to auth changes to handle multi-device login
    const subscription = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchRooms();
      }
    });
    
    // Return the cleanup function directly
    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    fetchRooms();
    
    // Subscribe to real-time updates for rooms
    const channel = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'room_members' 
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchRooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setRooms([]);
        setIsLoading(false);
        return;
      }
      
      // First, get the room IDs the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', session.user.id);
      
      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        setRooms([]);
        setIsLoading(false);
        return;
      }
      
      // Get the room IDs as an array of strings
      const roomIds = memberData.map(item => item.room_id);
      
      // Then fetch the full room data for those IDs
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          name,
          code,
          created_at,
          created_by
        `)
        .in('id', roomIds);
      
      if (error) throw error;
      
      setRooms(data || []);
    } catch (error: any) {
      console.error("Failed to fetch rooms:", error);
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
      
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: newRoomName,
          created_by: session.user.id,
          code: roomCode,
        })
        .select()
        .single();
      
      if (roomError) throw roomError;
      
      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          role: 'admin',
        });
      
      if (memberError) throw memberError;
      
      toast({
        title: "Room created",
        description: `Your room "${newRoomName}" has been created`,
      });
      
      setNewRoomName("");
      setShowCreateDialog(false);
      fetchRooms();
    } catch (error: any) {
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
      
      // Find the room
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
      
      // Check if already a member
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
      
      // Add user as member
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
  
  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Room code copied to clipboard",
    });
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
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>
                      Created {new Date(room.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
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
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View Room
                    </Button>
                  </CardFooter>
                </Card>
              ))}
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
    </div>
  );
};

export default Rooms;
