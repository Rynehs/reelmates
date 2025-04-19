import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserMinus, Crown, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/UserAvatar";
import FollowButton from './FollowButton';

interface RoomMembersListProps {
  roomId: string;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export const RoomMembersList = ({ roomId, isAdmin, onRefresh }: RoomMembersListProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('room_members')
          .select(`
            id,
            user_id,
            role,
            user:profiles!inner(id, username, avatar_url)
          `)
          .eq('room_id', roomId)
          .order('role', { ascending: false });
          
        if (error) throw error;
        
        // If we have a current user, fetch which members they follow
        if (currentUserId) {
          const { data: followingData, error: followingError } = await supabase
            .from('user_followers')
            .select('following_id')
            .eq('follower_id', currentUserId);
            
          if (!followingError) {
            // Create a map of user_id to following status
            const followMap: Record<string, boolean> = {};
            (followingData || []).forEach(item => {
              followMap[item.following_id] = true;
            });
            setFollowingMap(followMap);
          }
        }
        
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to load room members",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [roomId, toast, currentUserId]);

  const handleRemoveMember = async (memberId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the room",
      });
      
      // Remove the member from the local state
      setMembers(members.filter(member => member.id !== memberId));
      
      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('room_members')
        .update({ role: 'admin' })
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast({
        title: "Member promoted",
        description: "The member has been promoted to admin",
      });
      
      // Update the member's role in the local state
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: 'admin' } : member
      ));
      
      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error promoting member:', error);
      toast({
        title: "Error",
        description: "Failed to promote member",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <Link 
                  to={`/user/${member.user.id}`}
                  className="flex items-center gap-3 hover:bg-muted rounded-md p-2 transition-colors"
                >
                  <UserAvatar 
                    user={{ 
                      name: member.user.username || 'User', 
                      avatar_url: member.user.avatar_url 
                    }} 
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {member.user.username || 'User'}
                      {member.role === 'admin' && (
                        <Crown className="h-3 w-3 text-yellow-500 inline ml-1" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-2">
                  {currentUserId && currentUserId !== member.user.id && (
                    <FollowButton 
                      userId={member.user.id} 
                      isFollowing={!!followingMap[member.user.id]} 
                      size="sm"
                    />
                  )}
                  
                  {isAdmin && currentUserId !== member.user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.id)}>
                            <Crown className="mr-2 h-4 w-4" />
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member.id, member.user.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
