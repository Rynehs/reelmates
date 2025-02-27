
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

interface UserAvatarProps {
  user: Partial<User>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ user, className = "", size = "md" }: UserAvatarProps) => {
  const getSize = () => {
    switch (size) {
      case "sm": return "h-8 w-8";
      case "lg": return "h-12 w-12";
      default: return "h-10 w-10";
    }
  };
  
  const getFallbackSize = () => {
    switch (size) {
      case "sm": return "text-xs";
      case "lg": return "text-lg";
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

  return (
    <Avatar className={`${getSize()} ${className}`}>
      <AvatarImage src={user.avatar_url} alt={user.name || "User"} />
      <AvatarFallback className={getFallbackSize()}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
