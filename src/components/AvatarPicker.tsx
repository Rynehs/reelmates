
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { User, UserRound, Users, UsersRound, CircleUser } from "lucide-react";

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  className?: string;
}

// Define our preset avatars
export const PRESET_AVATARS = {
  USER: "/avatars/user.svg",
  USER_ROUND: "/avatars/user-round.svg",
  USERS: "/avatars/users.svg",
  USERS_ROUND: "/avatars/users-round.svg", 
  CIRCLE_USER: "/avatars/circle-user.svg",
  // Add custom avatar URLs
  PURPLE: "/avatars/purple-avatar.png",
  BLUE: "/avatars/blue-avatar.png",
  GREEN: "/avatars/green-avatar.png",
  ORANGE: "/avatars/orange-avatar.png",
  RED: "/avatars/red-avatar.png",
};

export const isPredefinedAvatar = (url: string): boolean => {
  return Object.values(PRESET_AVATARS).includes(url);
};

export const AvatarPicker = ({ selectedAvatar, onSelect, className }: AvatarPickerProps) => {
  const [selected, setSelected] = useState<string>(selectedAvatar || PRESET_AVATARS.USER);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <div className={cn("w-full", className)}>
      <RadioGroup 
        value={selected} 
        onValueChange={handleSelect}
        className="grid grid-cols-3 sm:grid-cols-5 gap-4"
      >
        {Object.entries(PRESET_AVATARS).map(([key, url]) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <Label 
              htmlFor={`avatar-${key}`} 
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all",
                selected === url 
                  ? "border-primary" 
                  : "border-transparent hover:border-primary/50"
              )}>
                {key === "USER" ? (
                  <User className="h-10 w-10 text-primary" />
                ) : key === "USER_ROUND" ? (
                  <UserRound className="h-10 w-10 text-primary" />
                ) : key === "USERS" ? (
                  <Users className="h-10 w-10 text-primary" />
                ) : key === "USERS_ROUND" ? (
                  <UsersRound className="h-10 w-10 text-primary" />
                ) : key === "CIRCLE_USER" ? (
                  <CircleUser className="h-10 w-10 text-primary" />
                ) : (
                  <div 
                    className="h-full w-full rounded-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${url})` }}
                  />
                )}
              </div>
              <span className="text-xs text-center">{key.replace(/_/g, ' ').toLowerCase()}</span>
            </Label>
            <RadioGroupItem 
              value={url} 
              id={`avatar-${key}`} 
              className="sr-only"
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
