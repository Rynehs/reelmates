
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface JoinRequest {
  id: string;
  room_id: string;
  user_id: string;
  message?: string | null;
  created_at: string;
  status: string;
  user?: User;
}

interface RoomJoinRequestsProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onRequestHandled: () => void;
}

const RoomJoinRequests = ({ roomId, isOpen, onClose, onRequestHandled }: RoomJoinRequestsProps) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchJoinRequests();
    }
  }, [isOpen, roomId]);

  const fetchJoinRequests = async () => {
    setLoading(true);
    try {
      const { data: requestsData, error } = await supabase
        .from('room_join_requests')
        .select(`
          id,
          room_id,
          user_id,
          status,
          message,
          created_at
        `)
        .eq('room_id', roomId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user info for each request
      const requestsWithUsers = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', request.user_id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            return {
              ...request,
              user: {
                id: request.user_id,
                username: "Unknown User"
              }
            };
          }

          return {
            ...request,
            user: userData
          };
        })
      );

      setRequests(requestsWithUsers);
    } catch (error) {
      console.error("Error fetching join requests:", error);
      toast({
        title: "Error",
        description: "Failed to load join requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, approved: boolean) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const { data: request, error: requestError } = await supabase
        .from('room_join_requests')
        .select('user_id, room_id')
        .eq('id', requestId)
        .single();
        
      if (requestError) throw requestError;
      
      // Update request status
      const { error: updateError } = await supabase
        .from('room_join_requests')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // If approved, add user to room members
      if (approved) {
        const { error: memberError } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: request.user_id,
            role: 'member'
          });
          
        if (memberError) throw memberError;
      }
      
      // Create notification for the user
      const { data: roomData } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', roomId)
        .single();
      
      const notificationTitle = approved ? "Room Join Request Approved" : "Room Join Request Declined";
      const notificationMessage = approved 
        ? `Your request to join "${roomData?.name || 'the room'}" has been approved.`
        : `Your request to join "${roomData?.name || 'the room'}" has been declined.`;
      
      // Create notification directly in the database
      await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'room_request',
          entity_id: roomId
        });
      
      toast({
        title: approved ? "Request Approved" : "Request Declined",
        description: approved 
          ? "User has been added to the room" 
          : "User has been notified that their request was declined",
      });
      
      // Remove the request from the local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // If all requests processed, close dialog
      if (requests.length === 1) {
        setTimeout(() => {
          onClose();
          onRequestHandled();
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling join request:", error);
      toast({
        title: "Error",
        description: "Failed to process join request",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Requests</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {requests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {request.user?.avatar_url ? (
                          <AvatarImage src={request.user.avatar_url} />
                        ) : (
                          <AvatarFallback>
                            {request.user?.username?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.user?.username || "Unknown User"}</h4>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.created_at).toLocaleString()}
                        </p>
                        {request.message && (
                          <p className="text-sm mt-2 bg-muted p-2 rounded">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRequest(request.id, false)}
                        disabled={processingIds.has(request.id)}
                      >
                        {processingIds.has(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleRequest(request.id, true)}
                        disabled={processingIds.has(request.id)}
                      >
                        {processingIds.has(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending join requests</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomJoinRequests;
