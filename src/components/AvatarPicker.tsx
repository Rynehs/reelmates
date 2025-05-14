
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// List of predefined avatar images
const predefinedAvatars = [
  "/avatars/blue-avatar.png",
  "/avatars/green-avatar.png",
  "/avatars/orange-avatar.png",
  "/avatars/purple-avatar.png",
  "/avatars/red-avatar.png",
  "/avatars/user-round.svg",
  "/avatars/circle-user.svg",
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

// Function to check if a string is a predefined avatar path
export const isPredefinedAvatar = (path: string): boolean => {
  return predefinedAvatars.includes(path);
};

// Function to check if a string is a valid Avataar config JSON
export const isAvataarConfig = (value: string): boolean => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && 'avatarStyle' in parsed;
  } catch (e) {
    return false;
  }
};

export const AvatarPicker = ({ selectedAvatar, onSelect }: AvatarPickerProps) => {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedAvatar}
        onValueChange={onSelect}
        className="grid grid-cols-4 gap-4"
      >
        {predefinedAvatars.map((avatar) => (
          <div key={avatar} className="flex flex-col items-center gap-2">
            <Label
              htmlFor={`avatar-${avatar}`}
              className={cn(
                "cursor-pointer flex flex-col items-center gap-2",
                selectedAvatar === avatar ? "ring-2 ring-primary" : ""
              )}
            >
              <div className="h-16 w-16 rounded-full overflow-hidden border">
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            </Label>
            <RadioGroupItem
              value={avatar}
              id={`avatar-${avatar}`}
              className="sr-only"
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
