
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@/lib/types";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

interface RoomChatProps {
  roomId: string;
}

const RoomChat = ({ roomId }: RoomChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        
        if (profileData) {
          setUser({
            id: data.user.id,
            name: profileData.username || data.user.email || 'Unknown',
            email: data.user.email || '',
            created_at: data.user.created_at || '',
            avatar_url: profileData.avatar_url
          });
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("messages")
          .select(`
            id,
            room_id,
            user_id,
            content,
            created_at,
            profiles(id, username, avatar_url)
          `)
          .eq("room_id", roomId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error",
            description: "Could not load messages",
            variant: "destructive",
          });
          return;
        }

        // Transform data to match Message interface
        const formattedMessages: Message[] = data.map((message: any) => ({
          id: message.id,
          room_id: message.room_id,
          user_id: message.user_id,
          content: message.content,
          created_at: message.created_at,
          user: message.profiles ? {
            id: message.profiles.id,
            name: message.profiles.username || "Unknown User",
            email: "",
            created_at: "",
            avatar_url: message.profiles.avatar_url
          } : undefined
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
        toast({
          title: "Error",
          description: "Could not load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchMessages();
    }

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room-${roomId}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg: Message = {
            id: payload.new.id,
            room_id: payload.new.room_id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user: userData ? {
              id: userData.id,
              name: userData.username || "Unknown User",
              email: "",
              created_at: "",
              avatar_url: userData.avatar_url
            } : undefined
          };

          setMessages((current) => [...current, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId, toast]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: content
        });

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Could not send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] overflow-hidden">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <MessageList 
              messages={messages}
              loading={loading}
              currentUserId={user?.id}
              formatTime={formatTime}
              formatDate={formatDate}
            />
          </div>
          <MessageInput 
            onSendMessage={handleSendMessage}
            isDisabled={!user}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomChat;
