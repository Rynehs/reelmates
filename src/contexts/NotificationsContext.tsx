
import React, { createContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationsContextType } from "@/types/notification.types";
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  subscribeToNotifications
} from "@/services/notification.service";

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let channel: any = null;

    const initNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const notificationData = await fetchNotifications();
        setNotifications(notificationData);
        setUnreadCount(notificationData.filter(n => !n.read).length);

        // Set up real-time subscription
        channel = subscribeToNotifications(session.user.id, (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: <Bell className="h-4 w-4" />
          });
        });
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initNotifications();

    return () => {
      if (channel) {
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
        addNotification 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
