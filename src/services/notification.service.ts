import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification.types";

// Mock user ID for testing purposes without authentication
const MOCK_USER_ID = "test-user-123";

export async function fetchNotifications() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id || MOCK_USER_ID;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
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
      type: item.type as "message" | "movie" | "room" | "room_request" | "system",
      read: item.read || false,
      entityId: item.entity_id,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Unexpected error in fetchNotifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error in markNotificationAsRead:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id || MOCK_USER_ID;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error in markAllNotificationsAsRead:", error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error removing notification:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error in deleteNotification:", error);
    throw error;
  }
}

export async function createNotification(notification: {
  title: string;
  message: string;
  type: "message" | "movie" | "room" | "room_request" | "system";
  entityId?: string;
  userId?: string; // Added userId parameter for direct targeting
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = notification.userId || session?.user.id || MOCK_USER_ID;

    console.log("Creating notification for user:", userId, notification);

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        entity_id: notification.entityId,
        read: false
      })
      .select();

    if (error) {
      console.error("Error adding notification:", error);
      throw error;
    }

    console.log("Notification created successfully:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error in createNotification:", error);
    throw error;
  }
}

export function subscribeToNotifications(userId: string, onNewNotification: (notification: Notification) => void) {
  console.log("Subscribing to notifications for user:", userId);
  
  const userIdToUse = userId || MOCK_USER_ID;
  
  const channel = supabase
    .channel('public:notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userIdToUse}`
      }, 
      payload => {
        console.log('New notification received:', payload);
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
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
    });
    
  return channel;
}

// Function to create a movie tag notification
export async function createMovieTagNotification(userId: string, movieTitle: string, roomName: string, roomId: string) {
  return createNotification({
    userId: userId,
    title: "You've been tagged in a movie",
    message: `You've been tagged to watch "${movieTitle}" in the room "${roomName}"`,
    type: "movie",
    entityId: roomId
  });
}

// Function to create a room request notification
export async function createRoomRequestNotification(userId: string, roomName: string, roomId: string, approved: boolean) {
  return createNotification({
    userId: userId,
    title: approved ? "Room Join Request Approved" : "Room Join Request Declined",
    message: approved 
      ? `Your request to join "${roomName}" has been approved.` 
      : `Your request to join "${roomName}" has been declined.`,
    type: "room_request",
    entityId: roomId
  });
}

// Removing the demo notification function
export async function createDemoNotification() {
  // Function removed as per user request
}
