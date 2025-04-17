import React, { createContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bell, MessageCircle, Film, Users, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationsContextType } from "@/types/notification.types";
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
} from "@/services/notification.service";

// Mock user ID for testing purposes without authentication
const MOCK_USER_ID = "test-user-123";

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let channel: any = null;

    const initNotifications = async () => {
      try {
        // Get user ID - either from session or use mock ID
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || MOCK_USER_ID;

        console.log("Initializing notifications for user:", userId);
        
        // Fetch existing notifications
        const notificationData = await fetchNotifications();
        console.log("Fetched notifications:", notificationData.length);
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.read).length);

        // Set up real-time subscription
        channel = subscribeToNotifications(userId, (newNotification) => {
          console.log("Received new notification in context:", newNotification);
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Get the appropriate icon based on notification type
          let icon;
          switch (newNotification.type) {
            case "message":
              icon = <MessageCircle className="h-4 w-4" />;
              break;
            case "movie":
              icon = <Film className="h-4 w-4" />;
              break;
            case "room":
              icon = <Users className="h-4 w-4" />;
              break;
            case "room_request":
              icon = <UserPlus className="h-4 w-4" />;
              break;
            default:
              icon = <Bell className="h-4 w-4" />;
          }

          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: icon
          });
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initNotifications();

    return () => {
      if (channel) {
        console.log("Cleaning up notification subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [toast]);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));

      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error in removeNotification:", error);
    }
  };

  const addNotification = async (notification: Omit<Notification, "id" | "createdAt" | "userId" | "read">) => {
    try {
      console.log("Adding notification in context:", notification);
      await createNotification(notification);
      // The realtime subscription will handle adding this to the state
    } catch (error) {
      console.error("Error in addNotification:", error);
    }
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification,
        addNotification,
        isInitialized
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
