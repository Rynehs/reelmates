
import { useState } from "react";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  Film, 
  Users, 
  Check, 
  Trash2, 
  AlertCircle,
  MessageCircle,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  switch (type) {
    case "message":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "movie":
      return <Film className="h-4 w-4 text-purple-500" />;
    case "room":
      return <Users className="h-4 w-4 text-green-500" />;
    case "system":
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { markAsRead, removeNotification } = useNotifications();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and entityId
    if (notification.entityId) {
      switch (notification.type) {
        case "movie":
          navigate(`/movie/${notification.entityId}`);
          break;
        case "room":
          navigate(`/room/${notification.entityId}`);
          break;
        case "message":
          navigate(`/room/${notification.entityId}`);
          break;
      }
    }
  };
  
  return (
    <div className={`p-3 border-b ${notification.read ? 'bg-background' : 'bg-accent/30'}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 cursor-pointer" onClick={handleClick}>
          <div className="font-medium text-sm">{notification.title}</div>
          <div className="text-xs text-muted-foreground">{notification.message}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationsPanel = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;
