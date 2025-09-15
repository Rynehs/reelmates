import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Film, ArrowLeft, Clock, Heart, Check } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import MovieCard from "@/components/MovieCard";
import { MediaItem } from "@/lib/types";

interface UserData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
  profile_visibility: string | null;
  movie_list_visibility: string | null;
}

interface UserMovie {
  id: string;
  movie_id: number;
  media_type: 'movie' | 'tv';  // Fixed: explicitly restricting to allowed values
  status: 'watched' | 'to_watch' | 'favorite';
  created_at: string;
  title?: string;
  poster_path?: string | null;
  notes?: string | null;
  rating?: number | null;
  updated_at?: string | null;
  user_id: string;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userMovies, setUserMovies] = useState<UserMovie[]>([]);
  const [mediaItems, setMediaItems] = useState<{[key: number]: MediaItem}>({});
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canViewProfile, setCanViewProfile] = useState(false);
  const [canViewMovies, setCanViewMovies] = useState(false);
  
  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch user data including profile, follower/following counts, rooms, and movies
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
        
        // Check privacy settings
        const isOwnProfile = currentUser?.id === id;
        const profileIsPublic = userData.profile_visibility === 'public';
        const movieListIsPublic = userData.movie_list_visibility === 'public';
        
        // Check if current user is following this user
        let isFollowing = false;
        if (currentUser && !isOwnProfile) {
          const { data: followData } = await supabase
            .from("user_followers")
            .select("id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", id)
            .single();
          isFollowing = !!followData;
        }
        
        const canViewProfile = isOwnProfile || profileIsPublic || 
          (userData.profile_visibility === 'friends' && isFollowing);
        const canViewMovies = isOwnProfile || movieListIsPublic || 
          (userData.movie_list_visibility === 'friends' && isFollowing);
          
        setCanViewProfile(canViewProfile);
        setCanViewMovies(canViewMovies);
        
        if (!canViewProfile) {
          setError("This profile is private");
          return;
        }
        
        // Fetch user's movies with detailed information (only if allowed)
        if (canViewMovies) {
          const { data: moviesData, error: moviesError } = await supabase
            .from("user_movies")
            .select("*")
            .eq("user_id", id)
            .order("created_at", { ascending: false });

          if (moviesError) {
            console.error("Error fetching user movies:", moviesError);
            // Don't throw error for movies, just log it
          } else {
            // Explicitly cast the movies data to match our UserMovie interface
            setUserMovies((moviesData || []) as UserMovie[]);
            console.log("Fetched user movies:", moviesData?.length || 0);
          }
        }

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
  }, [id, toast, currentUser]);
  
  // Prepare movie media items for display
  useEffect(() => {
    if (userMovies.length === 0) return;
    
    // Convert user movies to MediaItem format for MovieCard
    const mediaItemsMap: {[key: number]: MediaItem} = {};
    
    userMovies.forEach(movie => {
      mediaItemsMap[movie.movie_id] = {
        id: movie.movie_id,
        title: movie.title || `Movie ${movie.movie_id}`,
        name: movie.title,
        poster_path: movie.poster_path || null,
        backdrop_path: null,
        vote_average: 0,
        overview: "",
        genre_ids: [],
        media_type: movie.media_type || 'movie',
        release_date: '',
        first_air_date: '',
      };
    });
    
    setMediaItems(mediaItemsMap);
  }, [userMovies]);

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
  
  // Group movies by status
  const watchedMovies = userMovies.filter(movie => movie.status === 'watched');
  const toWatchMovies = userMovies.filter(movie => movie.status === 'to_watch');
  const favoriteMovies = userMovies.filter(movie => movie.status === 'favorite');

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

          {/* User Movies Tabs */}
          <div className="w-full md:w-2/3">
            {canViewMovies ? (
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    <Film className="mr-2 h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="watched">
                    <Check className="mr-2 h-4 w-4" />
                    Watched
                  </TabsTrigger>
                  <TabsTrigger value="watchlist">
                    <Clock className="mr-2 h-4 w-4" />
                    Watchlist
                  </TabsTrigger>
                  <TabsTrigger value="favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Movies & Shows ({userMovies.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {userMovies.map((movie) => (
                          <div key={movie.id} className="h-full">
                            {mediaItems[movie.movie_id] && (
                              <MovieCard 
                                media={mediaItems[movie.movie_id]} 
                                status={movie.status}
                                showActions={false}
                              />
                            )}
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
              
              <TabsContent value="watched" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Watched ({watchedMovies.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {watchedMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {watchedMovies.map((movie) => (
                          <div key={movie.id} className="h-full">
                            {mediaItems[movie.movie_id] && (
                              <MovieCard 
                                media={mediaItems[movie.movie_id]} 
                                status="watched"
                                showActions={false}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Check className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No watched media</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This user hasn't marked any movies or shows as watched
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="watchlist" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Watch Later ({toWatchMovies.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {toWatchMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {toWatchMovies.map((movie) => (
                          <div key={movie.id} className="h-full">
                            {mediaItems[movie.movie_id] && (
                              <MovieCard 
                                media={mediaItems[movie.movie_id]} 
                                status="to_watch"
                                showActions={false}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No watch later items</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This user hasn't added any movies or shows to watch later
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorites ({favoriteMovies.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favoriteMovies.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {favoriteMovies.map((movie) => (
                          <div key={movie.id} className="h-full">
                            {mediaItems[movie.movie_id] && (
                              <MovieCard 
                                media={mediaItems[movie.movie_id]} 
                                status="favorite"
                                showActions={false}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No favorite media</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This user hasn't marked any movies or shows as favorites
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Movie Lists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Private Movie Lists</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This user's movie lists are private
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
