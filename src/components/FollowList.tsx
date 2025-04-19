
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { Loader2, UsersRound } from "lucide-react";

// Define interfaces for query results
interface FollowerRecord {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface FollowingRecord {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const FollowList = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<FollowerRecord[]>([]);
  const [following, setFollowing] = useState<FollowingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.email || '',
          created_at: data.session.user.created_at,
        });
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch followers
        const { data: followersData, error: followersError } = await supabase
          .from('user_followers')
          .select('following_id(id, profiles(username, avatar_url))')
          .eq('follower_id', user.id);

        if (followersError) throw followersError;

        const processedFollowers = followersData?.map(item => ({
          id: item.following_id?.id || '',
          username: item.following_id?.profiles?.username || null,
          avatar_url: item.following_id?.profiles?.avatar_url || null
        })) || [];

        setFollowers(processedFollowers);

        // Fetch following
        const { data: followingData, error: followingError } = await supabase
          .from('user_followers')
          .select('following_id(id, profiles(username, avatar_url))')
          .eq('follower_id', user.id);

        if (followingError) throw followingError;

        const processedFollowing = followingData?.map(item => ({
          id: item.following_id?.id || '',
          username: item.following_id?.profiles?.username || null,
          avatar_url: item.following_id?.profiles?.avatar_url || null
        })) || [];

        setFollowing(processedFollowing);
      } catch (error) {
        console.error('Error fetching follow data:', error);
        toast({
          title: "Error",
          description: "Failed to load followers and following",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFollowData();
    }
  }, [user, toast]);

  const handleUnfollow = async (followingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;

      // Update local state
      setFollowing(prev => prev.filter(f => f.id !== followingId));
      
      toast({
        title: "Unfollowed",
        description: "You have successfully unfollowed the user"
      });
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="following">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="following" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users I'm Following</CardTitle>
            </CardHeader>
            <CardContent>
              {following.length > 0 ? (
                <div className="space-y-4">
                  {following.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <UserAvatar 
                              user={{ 
                                name: user.username || "Unknown User", 
                                avatar_url: user.avatar_url 
                              }} 
                            />
                            <div>
                              <Link 
                                to={`/user/${user.id}`} 
                                className="font-medium hover:underline hover:text-primary"
                              >
                                {user.username || "Unknown User"}
                              </Link>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUnfollow(user.id)}
                          >
                            Unfollow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersRound className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Following</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You're not following any users yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="followers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Followers</CardTitle>
            </CardHeader>
            <CardContent>
              {followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((user) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <UserAvatar 
                              user={{ 
                                name: user.username || "Unknown User", 
                                avatar_url: user.avatar_url 
                              }} 
                            />
                            <div>
                              <Link 
                                to={`/user/${user.id}`} 
                                className="font-medium hover:underline hover:text-primary"
                              >
                                {user.username || "Unknown User"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersRound className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Followers</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You don't have any followers yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowList;
