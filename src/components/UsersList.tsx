
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from './UserAvatar';

export const UsersList = () => {
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
        .select('*')
        .neq('id', currentUser?.id);
      
      if (error) throw error;
      return profiles;
    },
    enabled: !!currentUser,
  });

  const { data: following } = useQuery({
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
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} />
                <div>
                  <p className="font-medium">{user.username || 'Anonymous User'}</p>
                </div>
              </div>
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
