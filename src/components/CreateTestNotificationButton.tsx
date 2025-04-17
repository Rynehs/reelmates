
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell } from "lucide-react";

const CreateTestNotificationButton = () => {
  const { addNotification, isInitialized } = useNotifications();

  const handleCreateTestNotification = async () => {
    if (!isInitialized) {
      console.log("Notification system not yet initialized");
      return;
    }
    
    await addNotification({
      title: "Test Notification",
      message: "This is a test notification created by clicking the button.",
      type: "system",
      entityId: "test-" + Date.now()
    });
  };

  return (
    <Button 
      onClick={handleCreateTestNotification}
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      Create Test Notification
    </Button>
  );
};

export default CreateTestNotificationButton;
