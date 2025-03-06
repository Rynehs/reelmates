
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification.types";

export async function fetchNotifications() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    title: item.title,
    message: item.message,
    type: item.type as "message" | "movie" | "room" | "system",
    read: item.read || false,
    entityId: item.entity_id,
    createdAt: item.created_at
  }));
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", session.user.id)
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing notification:", error);
    throw error;
  }
}

export async function createNotification(notification: {
  title: string;
  message: string;
  type: "message" | "movie" | "room" | "system";
  entityId?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

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
    throw error;
  }
}

export function subscribeToNotifications(userId: string, onNewNotification: (notification: Notification) => void) {
  return supabase
    .channel('public:notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      payload => {
        const newNotification: Notification = {
          id: payload.new.id,
          userId: payload.new.user_id,
          title: payload.new.title,
          message: payload.new.message,
          type: payload.new.type as Notification['type'],
          read: payload.new.read || false,
          entityId: payload.new.entity_id,
          createdAt: payload.new.created_at
        };
        
        onNewNotification(newNotification);
      }
    )
    .subscribe();
}
