
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import type { RoomMember } from "@/lib/types";

interface RoomMembersListProps {
  roomId: string;
  isAdmin: boolean;
  onRefresh: () => void;
}

const RoomMembersList = ({ roomId, isAdmin, onRefresh }: RoomMembersListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    
    checkAuth();
    fetchRoomMembers();
  }, [roomId]);

  const fetchRoomMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error: membersError } = await supabase
        .from("room_members")
        .select(`
          id,
          room_id,
          user_id,
          role,
          joined_at
        `)
        .eq("room_id", roomId)
        .order("joined_at", { ascending: true });

      if (membersError) {
        throw membersError;
      }

      const transformedMembers = await Promise.all(
        membersData.map(async (member) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", member.user_id)
            .single();

          if (profileError) {
            console.error("Error fetching profile for user", member.user_id, profileError);
            return {
              ...member,
              role: member.role as "admin" | "member",
              user: {
                id: member.user_id,
                name: "Unknown User",
                email: "",
                created_at: "",
                avatar_url: undefined
              }
            };
          }

          return {
            ...member,
            role: member.role as "admin" | "member",
            user: {
              id: profileData.id,
              name: profileData.username || "Unknown User",
              email: "",
              created_at: "",
              avatar_url: profileData.avatar_url
            }
          };
        })
      );

      setMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching room members:", error);
      toast({
        title: "Error",
        description: "Failed to load room members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the room?")) {
      return;
    }
    
    try {
      setRemovingMemberId(memberId);
      
      const { error } = await supabase
        .from("room_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      await supabase
        .from("room_media")
        .delete()
        .eq("room_id", roomId)
        .eq("added_by", userId);

      fetchRoomMembers();
      onRefresh();
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the room",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentUserId || !confirm("Are you sure you want to leave this room?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Room left",
        description: "You have successfully left the room",
      });
      
      navigate('/rooms');
    } catch (error: any) {
      console.error('Error leaving room:', error);
      toast({
        title: "Error",
        description: "Failed to leave the room. Please try again.",
        variant: "destructive",
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

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No members found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This room doesn't have any members yet
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Members ({members.length})</CardTitle>
          {currentUserId && !isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLeaveRoom}
              className="text-destructive hover:bg-destructive/10"
            >
              Leave Room
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {members.map(member => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      user={{ 
                        name: member.user?.name || "Unknown User", 
                        avatar_url: member.user?.avatar_url 
                      }} 
                    />
                    <div>
                      <Link to={`/user/${member.user_id}`} className="font-medium hover:underline hover:text-primary">
                        {member.user?.name || "Unknown User"}
                      </Link>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                  <div>
                    {isAdmin && member.role !== "admin" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        disabled={removingMemberId === member.id}
                      >
                        {removingMemberId === member.id ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomMembersList;
