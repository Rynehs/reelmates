
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, SendIcon } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@/lib/types";

interface RoomChatProps {
  roomId: string;
}

const RoomChat = ({ roomId }: RoomChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
            profiles:user_id (
              id,
              username,
              avatar_url
            )
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
        const formattedMessages = data.map((message: any) => ({
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

          const newMessage: Message = {
            ...payload.new,
            user: userData ? {
              id: userData.id,
              name: userData.username || "Unknown User",
              email: "",
              created_at: "",
              avatar_url: userData.avatar_url
            } : undefined
          };

          setMessages((current) => [...current, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomId, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: newMessage.trim()
        })
        .select();

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Could not send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage("");
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

  const isNewDay = (index: number, messages: Message[]) => {
    if (index === 0) return true;
    
    const prevDate = new Date(messages[index - 1].created_at).toLocaleDateString();
    const currDate = new Date(messages[index].created_at).toLocaleDateString();
    
    return prevDate !== currDate;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] overflow-hidden">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="space-y-4">
                      {isNewDay(index, messages) && (
                        <div className="flex justify-center my-2">
                          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      )}
                      <div className={`flex items-start gap-2 ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        {message.user_id !== user?.id && (
                          <UserAvatar
                            size="sm"
                            user={{
                              id: message.user_id,
                              name: message.user?.name || "Unknown",
                              avatar_url: message.user?.avatar_url
                            }}
                          />
                        )}
                        <div className={`max-w-[80%] flex flex-col ${message.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                          {message.user_id !== user?.id && (
                            <span className="text-xs text-muted-foreground mb-1">{message.user?.name || "Unknown"}</span>
                          )}
                          <div className={`rounded-lg px-3 py-2 ${
                            message.user_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{formatTime(message.created_at)}</span>
                        </div>
                        {message.user_id === user?.id && (
                          <UserAvatar
                            size="sm"
                            user={{
                              id: message.user_id,
                              name: user?.name || "You",
                              avatar_url: user?.avatar_url
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="mt-4 flex items-end gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={!user}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newMessage.trim() || !user}
              className="h-10 w-10"
            >
              <SendIcon className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomChat;
