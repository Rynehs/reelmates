
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import UserAvatar from "@/components/UserAvatar";
import Navbar from "@/components/Navbar";
import { Room, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Rooms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    // Check authentication
    const authenticated = localStorage.getItem("authenticated") === "true";
    if (!authenticated) {
      navigate("/");
      return;
    }
    
    // Get user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Get rooms
    fetchRooms();
  }, [navigate]);
  
  const fetchRooms = () => {
    setIsLoading(true);
    
    // In a real app, we'd fetch rooms from the database
    // For now, let's use mock data
    setTimeout(() => {
      setRooms([
        {
          id: "1",
          name: "Movie Night Group",
          created_by: "1",
          code: "MOVIE123",
          created_at: new Date().toISOString(),
          members: [
            {
              id: "1",
              room_id: "1",
              user_id: "1",
              role: "admin",
              joined_at: new Date().toISOString(),
              user: {
                id: "1",
                email: "demo@example.com",
                name: "Demo User",
                created_at: new Date().toISOString()
              }
            },
            {
              id: "2",
              room_id: "1",
              user_id: "2",
              role: "member",
              joined_at: new Date().toISOString(),
              user: {
                id: "2",
                email: "jane@example.com",
                name: "Jane Smith",
                created_at: new Date().toISOString()
              }
            }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast({
        title: "Missing room name",
        description: "Please enter a name for your room",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we'd send this to the database
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: roomName,
      created_by: user.id || "1",
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      members: [
        {
          id: `member-${Date.now()}`,
          room_id: `room-${Date.now()}`,
          user_id: user.id || "1",
          role: "admin",
          joined_at: new Date().toISOString(),
          user: user as User
        }
      ]
    };
    
    setRooms(prevRooms => [newRoom, ...prevRooms]);
    setRoomName("");
    
    toast({
      title: "Room created",
      description: `Your new room "${newRoom.name}" has been created with code: ${newRoom.code}`,
    });
  };
  
  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Missing room code",
        description: "Please enter a room code to join",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we'd verify the code with the database
    // For now, let's just check if the code matches any of our mock rooms
    const roomToJoin = rooms.find(room => room.code === joinCode.toUpperCase());
    
    if (roomToJoin) {
      // Check if user is already a member
      const isMember = roomToJoin.members.some(member => member.user_id === user.id);
      
      if (isMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this room",
          variant: "destructive",
        });
      } else {
        // Add user to room members
        const updatedRoom = {
          ...roomToJoin,
          members: [
            ...roomToJoin.members,
            {
              id: `member-${Date.now()}`,
              room_id: roomToJoin.id,
              user_id: user.id || "1",
              role: "member",
              joined_at: new Date().toISOString(),
              user: user as User
            }
          ]
        };
        
        setRooms(prevRooms => 
          prevRooms.map(room => room.id === updatedRoom.id ? updatedRoom : room)
        );
        
        setJoinCode("");
        
        toast({
          title: "Room joined",
          description: `You have joined "${updatedRoom.name}"`,
        });
      }
    } else {
      toast({
        title: "Invalid room code",
        description: "No room found with that code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="app-header py-4">
        <div className="reelmates-container">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Movie Rooms</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={fetchRooms}
            >
              <RefreshCw className="h-5 w-5" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="reelmates-container py-6">
        <section className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Create a movie room to share and discuss films with friends
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="room-name" className="text-sm font-medium">
                      Room Name
                    </label>
                    <Input
                      id="room-name"
                      placeholder="Weekend Movie Club"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateRoom}>Create Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Users className="h-4 w-4 mr-2" />
                  Join Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Existing Room</DialogTitle>
                  <DialogDescription>
                    Enter a room code to join an existing movie room
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="room-code" className="text-sm font-medium">
                      Room Code
                    </label>
                    <Input
                      id="room-code"
                      placeholder="Enter 6-digit code (e.g. ABC123)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleJoinRoom}>Join Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="my-rooms">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-rooms" className="animate-fade-in">
              {isLoading ? (
                <div className="grid gap-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-6 bg-muted rounded w-2/3 mb-1"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-8 w-8 rounded-full bg-muted"></div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-9 bg-muted rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid gap-4">
                  {rooms.map(room => (
                    <Card key={room.id} className="card-transition hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>
                          Room Code: {room.code}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex -space-x-2">
                          {room.members.slice(0, 5).map(member => (
                            <UserAvatar
                              key={member.id}
                              user={member.user || {}}
                              size="sm"
                              className="border-2 border-background"
                            />
                          ))}
                          {room.members.length > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                              +{room.members.length - 5}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => navigate(`/room/${room.id}`)}
                        >
                          Enter Room
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No rooms yet</h3>
                  <p className="text-muted-foreground mb-4">Create a room to start sharing movies with friends</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-1" />
                        Create Your First Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Room</DialogTitle>
                        <DialogDescription>
                          Create a movie room to share and discuss films with friends
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label htmlFor="room-name-2" className="text-sm font-medium">
                            Room Name
                          </label>
                          <Input
                            id="room-name-2"
                            placeholder="Weekend Movie Club"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateRoom}>Create Room</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="invites" className="animate-fade-in">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No room invites</h3>
                <p className="text-muted-foreground mb-4">
                  When someone invites you to a room, it will appear here
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Join a Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Existing Room</DialogTitle>
                      <DialogDescription>
                        Enter a room code to join an existing movie room
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="room-code-2