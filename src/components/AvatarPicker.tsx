
import React from "react";
import { Button } from "@/components/ui/button";

// Preset avatar options
const presetAvatars = [
  "/avatars/blue-avatar.png",
  "/avatars/green-avatar.png",
  "/avatars/orange-avatar.png",
  "/avatars/purple-avatar.png",
  "/avatars/red-avatar.png",
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

export function AvatarPicker({ selectedAvatar, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {presetAvatars.map((avatar) => (
        <Button
          key={avatar}
          type="button"
          variant={selectedAvatar === avatar ? "default" : "outline"}
          className="relative aspect-square p-0 overflow-hidden"
          onClick={() => onSelect(avatar)}
        >
          <img 
            src={avatar} 
            alt="Avatar option" 
            className="w-full h-full object-cover"
          />
        </Button>
      ))}
    </div>
  );
}
