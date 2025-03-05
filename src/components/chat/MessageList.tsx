
import { useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import { Loader2 } from "lucide-react";
import MessageItem from "./MessageItem";
import DateSeparator from "./DateSeparator";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | undefined;
  formatTime: (dateString: string) => string;
  formatDate: (dateString: string) => string;
}

const MessageList = ({ 
  messages, 
  loading, 
  currentUserId,
  formatTime,
  formatDate 
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isNewDay = (index: number, messages: Message[]) => {
    if (index === 0) return true;
    
    const prevDate = new Date(messages[index - 1].created_at).toLocaleDateString();
    const currDate = new Date(messages[index].created_at).toLocaleDateString();
    
    return prevDate !== currDate;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {messages.map((message, index) => (
        <div key={message.id} className="space-y-4">
          {isNewDay(index, messages) && (
            <DateSeparator date={formatDate(message.created_at)} />
          )}
          <MessageItem 
            message={message} 
            isCurrentUser={message.user_id === currentUserId}
            formatTime={formatTime}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
