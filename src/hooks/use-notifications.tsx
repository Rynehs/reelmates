
import { useContext } from "react";
import { NotificationsContext } from "@/contexts/NotificationsContext";
import { Notification } from "@/types/notification.types";

export type { Notification };
export { NotificationsProvider } from "@/contexts/NotificationsContext";

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
