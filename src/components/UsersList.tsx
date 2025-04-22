import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from './UserAvatar';
import { Badge } from "@/components/ui/badge";

interface UserWithFollowers {
  id: string;
  username: string | null;
  avatar_url?: string | null;
  followers?: Array<{count: number}> | null;
  following?: Array<{count: number}> | null;
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
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers:user_followers!following_id(count),
          following:user_followers!follower_id(count)
        `)
        .neq('id', currentUser?.id);
      
      if (error) throw error;
      return profiles as UserWithFollowers[];
    },
    enabled: !!currentUser,
  });

  const { data: following, refetch: refetchFollowing } = useQuery({
    queryKey: ['following', currentUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', currentUser?.id);
      
      if (error) throw error;
      return data.map(f => f.following_id);
    },
    enabled: !!currentUser,
  });

  const handleFollow = async (userId: string) => {
    try {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (usersLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Other Movie Enthusiasts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
              <Link to={`/user/${user.id}`} className="flex items-center space-x-3 flex-1">
                <UserAvatar user={user} />
                <div>
                  <p className="font-medium">{user.username || 'Anonymous User'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {user.followers && 
                       Array.isArray(user.followers) && 
                       user.followers[0] && 
                       typeof user.followers[0].count === 'number' 
                        ? user.followers[0].count 
                        : 0} followers
                    </Badge>
                  </div>
                </div>
              </Link>
              {following?.includes(user.id) ? (
                <Button 
                  variant="outline" 
                  onClick={() => handleUnfollow(user.id)}
                  size="sm"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow
                </Button>
              ) : (
                <Button 
                  onClick={() => handleFollow(user.id)}
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              )}
            </div>
          ))}
          {users?.length === 0 && (
            <p className="text-center text-muted-foreground">No other users found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
