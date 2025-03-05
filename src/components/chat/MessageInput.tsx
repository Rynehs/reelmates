
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isDisabled: boolean;
}

const MessageInput = ({ onSendMessage, isDisabled }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isDisabled) return;
    
    await onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1"
        disabled={isDisabled}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!newMessage.trim() || isDisabled}
        className="h-10 w-10"
      >
        <SendIcon className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
