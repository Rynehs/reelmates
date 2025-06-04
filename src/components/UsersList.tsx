
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from './UserAvatar';
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface UserWithFollowers {
  id: string;
  username: string | null;
  avatar_url?: string | null;
  followers_count?: number;
  following_count?: number;
  [key: string]: any;
}

const UsersList = () => {
  const { toast } = useToast();
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
  });

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      console.log("Fetching user profiles...");
      
      // Get all profiles except current user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id);
      
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      console.log("Fetched profiles:", profiles?.length || 0);
      
      // Get following counts for each profile
      const profilesWithCounts = await Promise.all((profiles || []).map(async (profile) => {
        // Get follower count
        const { data: followers, error: followersError } = await supabase
          .from('user_followers')
          .select('id', { count: 'exact' })
          .eq('following_id', profile.id);
          
        if (followersError) console.error("Error fetching followers:", followersError);
        
        // Get following count  
        const { data: following, error: followingError } = await supabase
          .from('user_followers')
          .select('id', { count: 'exact' })
          .eq('follower_id', profile.id);
          
        if (followingError) console.error("Error fetching following:", followingError);
        
        return {
          ...profile,
          followers_count: followers?.length || 0,
          following_count: following?.length || 0,
        } as UserWithFollowers;
      }));
      
      return profilesWithCounts;
    },
    enabled: !!currentUser,
  });

  const { data: following, isLoading: followingLoading, refetch: refetchFollowing } = useQuery({
    queryKey: ['following', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      console.log("Fetching user following status...");
      
      const { data, error } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);
      
      if (error) {
        console.error("Error fetching following data:", error);
        throw error;
      }
      
      console.log("Fetched following relationships:", data?.length || 0);
      return data?.map(f => f.following_id) || [];
    },
    enabled: !!currentUser,
  });

  const handleFollow = async (userId: string) => {
    try {
      console.log("Following user:", userId);
      
      const { error } = await supabase
        .from('user_followers')
        .insert({
          follower_id: currentUser?.id,
          following_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You are now following this user",
      });
      
      refetchUsers();
      refetchFollowing();
    } catch (error: any) {
      console.error("Follow error:", error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      console.log("Unfollowing user:", userId);
      
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .match({ follower_id: currentUser?.id, following_id: userId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
      
      refetchUsers();
      refetchFollowing();
    } catch (error: any) {
      console.error("Unfollow error:", error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Log loading state and data for debugging
  useEffect(() => {
    console.log("UsersList component - current user:", currentUser?.id);
    console.log("UsersList component - users loading:", usersLoading);
    console.log("UsersList component - users count:", users?.length);
    console.log("UsersList component - following loading:", followingLoading);
    console.log("UsersList component - following count:", following?.length);
  }, [currentUser, users, usersLoading, following, followingLoading]);

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Other Movie Enthusiasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Please sign in to see other users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usersLoading || followingLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Other Movie Enthusiasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Other Movie Enthusiasts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-accent/50 gap-2">
                <Link to={`/user/${user.id}`} className="flex items-center space-x-3 min-w-0">
                  <div className="flex-shrink-0">
                    <UserAvatar user={user} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.username || 'Anonymous User'}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {user.followers_count || 0} followers
                      </Badge>
                    </div>
                  </div>
                </Link>
                {following && (
                  <div className="mt-2 sm:mt-0 flex-shrink-0">
                    {following.includes(user.id) ? (
                      <Button 
                        variant="outline" 
                        onClick={() => handleUnfollow(user.id)}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <UserMinus className="sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Unfollow</span>
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleFollow(user.id)}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <UserPlus className="sm:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Follow</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No other users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
