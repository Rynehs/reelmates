
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface RoomInputCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoomInputCodeDialog({ isOpen, onClose }: RoomInputCodeDialogProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-character room code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to join a room",
          variant: "destructive",
        });
        return;
      }
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('code', code)
        .single();
      
      if (roomError) {
        toast({
          title: "Invalid room code",
          description: "The room code you entered doesn't exist",
          variant: "destructive",
        });
        return;
      }
      
      const { data: existingMembership, error: membershipError } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingMembership) {
        toast({
          title: "Already a member",
          description: "You are already a member of this room",
        });
        navigate(`/room/${room.id}`);
        return;
      }
      
      const { error: joinError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: session.user.id,
          role: 'member',
        });
      
      if (joinError) throw joinError;
      
      toast({
        title: "Room joined",
        description: `You have joined "${room.name}"`,
      });
      
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      toast({
        title: "Failed to join room",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Room Code</DialogTitle>
          <DialogDescription>
            Enter the 6-character code to join a movie room
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleVerifyCode} disabled={isVerifying || code.length !== 6}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
