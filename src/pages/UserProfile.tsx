
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Film, ArrowLeft } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface UserData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userMedia, setUserMedia] = useState<any[]>([]);
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching user profile with ID:", id);
        
        // Fetch the basic user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }
        
        if (!profileData) {
          throw new Error("User profile not found");
        }
        
        console.log("Fetched profile data:", profileData);
        
        // Get follower count (how many users follow this user)
        const { count: followerCount, error: followerError } = await supabase
          .from("user_followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", id);
        
        if (followerError) {
          console.error("Error fetching follower count:", followerError);
        }
        
        // Get following count (how many users this user follows)
        const { count: followingCount, error: followingError } = await supabase
          .from("user_followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", id);
        
        if (followingError) {
          console.error("Error fetching following count:", followingError);
        }
        
        // Combine the data
        const userData: UserData = {
          ...profileData,
          followers_count: followerCount || 0,
          following_count: followingCount || 0
        };
        
        setUserData(userData);
        console.log("Combined user data:", userData);
        
        // Fetch user's media items
        const { data: mediaData, error: mediaError } = await supabase
          .from("user_movies")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false });
        
        if (mediaError) {
          console.error("Error fetching user media:", mediaError);
          throw new Error(`Failed to fetch user media: ${mediaError.message}`);
        }
        
        setUserMedia(mediaData || []);
        console.log("Fetched user media items:", mediaData?.length || 0);

        // Fetch user's rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("room_members")
          .select(`
            rooms (
              id,
              name,
              description,
              profile_icon,
              created_at
            )
          `)
          .eq("user_id", id);

        if (roomsError) {
          console.error("Error fetching user rooms:", roomsError);
          throw new Error(`Failed to fetch user rooms: ${roomsError.message}`);
        }
        
        setUserRooms(roomsData?.map(r => r.rooms) || []);
        console.log("Fetched user rooms:", roomsData?.length || 0);
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load user data";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, toast]);

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

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">User Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              {error || "We couldn't find the user you're looking for."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/rooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* User Profile Card */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <UserAvatar 
                  user={{ 
                    name: userData?.username || "User", 
                    avatar_url: userData?.avatar_url 
                  }} 
                  size="lg"
                  className="mb-4"
                />
                <h2 className="text-xl font-bold mb-2">{userData?.username || "User"}</h2>
                <div className="flex gap-4 mb-4">
                  <Badge variant="secondary">
                    {userData.followers_count} followers
                  </Badge>
                  <Badge variant="secondary">
                    {userData.following_count} following
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : '-'}
                </p>
              </CardContent>
            </Card>

            {/* User's Rooms */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Movie Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRooms.map((room: any) => (
                    <Link 
                      key={room.id} 
                      to={`/room/${room.id}`}
                      className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      {room.profile_icon ? (
                        <img 
                          src={room.profile_icon} 
                          alt={room.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {room.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(room.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {userRooms.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Not a member of any rooms yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Tabs */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="movies">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="movies">
                  <Film className="mr-2 h-4 w-4" />
                  Movies & Shows
                </TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="movies" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Watched Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userMedia.length > 0 ? (
                      <div className="space-y-4">
                        {userMedia.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                            <Film className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Movie ID: {item.movie_id}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                Status: {item.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No media found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This user hasn't added any movies or shows yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Activity tracking coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
