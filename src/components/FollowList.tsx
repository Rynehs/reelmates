import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface UserProfileWithFollow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  isFollowing?: boolean;
}

interface FollowListProps {
  userId: string;
  currentUserId?: string | null;
}

const FollowList = ({ userId, currentUserId }: FollowListProps) => {
  const [followers, setFollowers] = useState<UserProfileWithFollow[]>([]);
  const [following, setFollowing] = useState<UserProfileWithFollow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch followers
        const { data: followersData } = await supabase
          .from('user_followers')
          .select(`
            follower:profiles!user_followers_follower_id_fkey(
              id,
              username,
              avatar_url
            )
          `)
          .eq('following_id', userId);
        
        // Fetch following
        const { data: followingData } = await supabase
          .from('user_followers')
          .select(`
            following:profiles!user_followers_following_id_fkey(
              id,
              username,
              avatar_url
            )
          `)
          .eq('follower_id', userId);
        
        // Check which users the current user is following
        let currentUserFollowing: string[] = [];
        if (currentUserId) {
          const { data: currentFollowing } = await supabase
            .from('user_followers')
            .select('following_id')
            .eq('follower_id', currentUserId);
            
          currentUserFollowing = (currentFollowing || []).map(f => f.following_id);
        }
        
        const formattedFollowers: UserProfileWithFollow[] = [];
        if (followersData) {
          for (const item of followersData) {
            if (item.follower) {
              formattedFollowers.push({
                id: item.follower.id,
                username: item.follower.username,
                avatar_url: item.follower.avatar_url,
                isFollowing: currentUserFollowing.includes(item.follower.id)
              });
            }
          }
        }
        
        const formattedFollowing: UserProfileWithFollow[] = [];
        if (followingData) {
          for (const item of followingData) {
            if (item.following) {
              formattedFollowing.push({
                id: item.following.id,
                username: item.following.username,
                avatar_url: item.following.avatar_url,
                isFollowing: currentUserFollowing.includes(item.following.id)
              });
            }
          }
        }
        
        setFollowers(formattedFollowers);
        setFollowing(formattedFollowing);
      } catch (error) {
        console.error('Error fetching follow data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchFollowData();
    }
  }, [userId, currentUserId]);

  const renderUserList = (users: UserProfileWithFollow[]) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ));
    }
    
    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      );
    }
    
    return users.map(user => (
      <Link 
        key={user.id} 
        to={`/user/${user.id}`}
        className="flex items-center gap-3 p-3 hover:bg-muted rounded-md transition-colors"
      >
        <Avatar>
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.username || 'User'} />
          ) : (
            <AvatarFallback>
              {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-medium">{user.username || 'User'}</p>
          {user.isFollowing !== undefined && currentUserId && currentUserId !== user.id && (
            <p className="text-xs text-muted-foreground">
              {user.isFollowing ? 'Following' : 'Not following'}
            </p>
          )}
        </div>
      </Link>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers {followers.length > 0 && `(${followers.length})`}
            </TabsTrigger>
            <TabsTrigger value="following">
              Following {following.length > 0 && `(${following.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {renderUserList(followers)}
            </div>
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {renderUserList(following)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FollowList;
