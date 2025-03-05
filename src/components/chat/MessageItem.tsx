
import { Message } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  formatTime: (dateString: string) => string;
}

const MessageItem = ({ message, isCurrentUser, formatTime }: MessageItemProps) => {
  return (
    <div className={`flex items-start gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <UserAvatar
          size="sm"
          user={{
            id: message.user_id,
            name: message.user?.name || "Unknown",
            avatar_url: message.user?.avatar_url
          }}
        />
      )}
      <div className={`max-w-[80%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground mb-1">{message.user?.name || "Unknown"}</span>
        )}
        <div className={`rounded-lg px-3 py-2 ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">{formatTime(message.created_at)}</span>
      </div>
      {isCurrentUser && (
        <UserAvatar
          size="sm"
          user={{
            id: message.user_id,
            name: message.user?.name || "You",
            avatar_url: message.user?.avatar_url
          }}
        />
      )}
    </div>
  );
};

export default MessageItem;
