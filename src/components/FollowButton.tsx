
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost";
}

const FollowButton = ({ 
  userId, 
  isFollowing: initialIsFollowing, 
  onFollowChange,
  size = "default",
  variant = "outline"
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to follow users",
          variant: "destructive",
        });
        return;
      }
      
      if (isFollowing) {
        // Unfollow the user
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .match({ follower_id: currentUserId, following_id: userId });
          
        if (error) throw error;
        
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
        });
      } else {
        // Follow the user
        const { error } = await supabase
          .from('user_followers')
          .insert({ follower_id: currentUserId, following_id: userId });
          
        if (error) throw error;
        
        toast({
          title: "Following",
          description: "You are now following this user",
        });
      }
      
      // Toggle the following state
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
