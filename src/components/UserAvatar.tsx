
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { useState } from "react";
import { Loader2, User as UserIcon, UserRound, Users, UsersRound, CircleUser } from "lucide-react";
import { isPredefinedAvatar, PRESET_AVATARS } from "./AvatarPicker";

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
  
  const getIconSize = () => {
    switch (size) {
      case "xs": return "h-3 w-3";
      case "sm": return "h-4 w-4";
      case "lg": return "h-7 w-7";
      case "xl": return "h-12 w-12";
      default: return "h-6 w-6";
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

  // Check if avatar is a predefined one
  const isPredefined = user.avatar_url && isPredefinedAvatar(user.avatar_url);
  
  // Render predefined icon if needed
  const renderPredefinedAvatar = () => {
    if (!user.avatar_url) return null;
    
    const iconProps = { className: getIconSize() + " text-primary" };
    
    if (user.avatar_url === PRESET_AVATARS.USER) {
      return <UserIcon {...iconProps} />;
    } else if (user.avatar_url === PRESET_AVATARS.USER_ROUND) {
      return <UserRound {...iconProps} />;
    } else if (user.avatar_url === PRESET_AVATARS.USERS) {
      return <Users {...iconProps} />;
    } else if (user.avatar_url === PRESET_AVATARS.USERS_ROUND) {
      return <UsersRound {...iconProps} />;
    } else if (user.avatar_url === PRESET_AVATARS.CIRCLE_USER) {
      return <CircleUser {...iconProps} />;
    } else {
      // For other preset avatars (images)
      return (
        <AvatarImage 
          src={user.avatar_url} 
          alt={user.name || "User"} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={isLoading ? "opacity-0" : "opacity-100"}
        />
      );
    }
  };

  return (
    <Avatar className={`${getSize()} ${className} relative`}>
      {user.avatar_url && !hasError ? (
        <>
          {isLoading && !isPredefined && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          )}
          {isPredefined ? (
            <div className="flex items-center justify-center h-full w-full">
              {renderPredefinedAvatar()}
            </div>
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
      ) : null}
      {(!user.avatar_url || hasError) && (
        <AvatarFallback className={getFallbackSize()}>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
