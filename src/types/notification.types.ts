
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

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "userId" | "read">) => Promise<void>;
}
