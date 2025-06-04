
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { isPredefinedAvatar, isAvataarConfig } from "./AvatarPicker";
import Avatar from "avataaars";

interface UserAvatarProps {
  user: Partial<User>;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLoadingState?: boolean;
}

const UserAvatar = ({ 
  user, 
  className = "", 
  size = "md", 
  showLoadingState = false 
}: UserAvatarProps) => {
  const [isLoading, setIsLoading] = useState(showLoadingState);
  const [hasError, setHasError] = useState(false);
  
  const getSize = () => {
    switch (size) {
      case "xs": return "h-6 w-6";
      case "sm": return "h-8 w-8";
      case "lg": return "h-12 w-12";
      case "xl": return "h-24 w-24";
      default: return "h-10 w-10";
    }
  };
  
  const getFallbackSize = () => {
    switch (size) {
      case "xs": return "text-xs";
      case "sm": return "text-xs";
      case "lg": return "text-lg";
      case "xl": return "text-xl";
      default: return "text-sm";
    }
  };
  
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Check if avatar is an Avataar config
  const isAvataar = user.avatar_url && isAvataarConfig(user.avatar_url);
  
  // Render Avataar if the avatar_url is a valid Avataar config
  const renderAvataar = () => {
    if (!user.avatar_url || !isAvataar) return null;
    
    try {
      const config = JSON.parse(user.avatar_url);
      return (
        <div className="flex items-center justify-center h-full w-full">
          <Avatar
            style={{ width: '100%', height: '100%' }}
            {...config}
          />
        </div>
      );
    } catch (e) {
      console.error("Error rendering avataar:", e);
      return null;
    }
  };

  return (
    <UIAvatar className={`${getSize()} ${className} relative`}>
      {user.avatar_url && !hasError && (
        <>
          {isLoading && !isAvataar && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
          
          {isAvataar ? (
            renderAvataar()
          ) : (
            <AvatarImage 
              src={user.avatar_url} 
              alt={user.name || "User"} 
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={isLoading ? "opacity-0" : "opacity-100"}
            />
          )}
        </>
      )}
      {(!user.avatar_url || hasError) && (
        <AvatarFallback className={getFallbackSize()}>
          {initials}
        </AvatarFallback>
      )}
    </UIAvatar>
  );
};

export default UserAvatar;
