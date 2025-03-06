
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "message" | "movie" | "room" | "system";
  read: boolean;
  entityId?: string;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "userId" | "read">) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      const formattedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        message: item.message,
        type: item.type,
        read: item.read,
        entityId: item.entity_id,
        createdAt: item.created_at
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        }, 
        payload => {
          const newNotification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type as Notification['type'],
            read: payload.new.read,
            entityId: payload.new.entity_id,
            createdAt: payload.new.created_at
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          toast({
            title: newNotification.title,
            description: newNotification.message,
            action: (
              <Bell className="h-4 w-4" />
            )
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.user.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return;
    }

    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );

    setUnreadCount(0);
  };

  const removeNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing notification:", error);
      return;
    }

    const wasUnread = notifications.find(n => n.id === id)?.read === false;
    
    setNotifications(prev => prev.filter(notif => notif.id !== id));

    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const addNotification = async (notification: Omit<Notification, "id" | "createdAt" | "userId" | "read">) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: session.user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        entity_id: notification.entityId,
        read: false
      });

    if (error) {
      console.error("Error adding notification:", error);
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

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
