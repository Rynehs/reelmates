
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import Avatar from "avataaars";

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  className?: string;
}

// Define preset avatar configurations
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
  
  // Replace the icon avatars with Avataaars configurations (stored as JSON strings)
  AVATAR1: JSON.stringify({
    avatarStyle: 'Circle',
    topType: 'LongHairStraight',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    clotheType: 'BlazerShirt',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  }),
  AVATAR2: JSON.stringify({
    avatarStyle: 'Circle',
    topType: 'ShortHairShortWaved',
    accessoriesType: 'Prescription02',
    hairColor: 'Black',
    facialHairType: 'BeardMedium',
    facialHairColor: 'Black',
    clotheType: 'Hoodie',
    clotheColor: 'Blue03',
    eyeType: 'Happy',
    eyebrowType: 'RaisedExcited',
    mouthType: 'Smile',
    skinColor: 'Light'
  }),
  AVATAR3: JSON.stringify({
    avatarStyle: 'Circle',
    topType: 'LongHairBob',
    accessoriesType: 'Round',
    hairColor: 'Auburn',
    facialHairType: 'Blank',
    clotheType: 'GraphicShirt',
    clotheColor: 'Pink',
    graphicType: 'Diamond',
    eyeType: 'Wink',
    eyebrowType: 'Default',
    mouthType: 'Twinkle',
    skinColor: 'Pale'
  }),
  AVATAR4: JSON.stringify({
    avatarStyle: 'Circle',
    topType: 'WinterHat4',
    hatColor: 'Red',
    accessoriesType: 'Blank',
    hairColor: 'Blonde',
    facialHairType: 'Blank',
    clotheType: 'CollarSweater',
    clotheColor: 'Gray02',
    eyeType: 'Squint',
    eyebrowType: 'UpDown',
    mouthType: 'ScreamOpen',
    skinColor: 'DarkBrown'
  }),
  AVATAR5: JSON.stringify({
    avatarStyle: 'Circle',
    topType: 'Hijab',
    accessoriesType: 'Blank',
    hatColor: 'PastelRed',
    hairColor: 'Black',
    facialHairType: 'Blank',
    clotheType: 'ShirtScoopNeck',
    clotheColor: 'Blue02',
    eyeType: 'Surprised',
    eyebrowType: 'RaisedExcited',
    mouthType: 'Smile',
    skinColor: 'Brown'
  })
};

export const isPredefinedAvatar = (url: string): boolean => {
  return Object.values(PRESET_AVATARS).includes(url) || isAvataarConfig(url);
};

// Helper to check if a string is a valid Avataar config
export const isAvataarConfig = (str: string): boolean => {
  try {
    const config = JSON.parse(str);
    return config && config.avatarStyle && config.topType;
  } catch (e) {
    return false;
  }
};

export const AvatarPicker = ({ selectedAvatar, onSelect, className }: AvatarPickerProps) => {
  const [selected, setSelected] = useState<string>(selectedAvatar || PRESET_AVATARS.AVATAR1);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value);
  };

  const renderAvatar = (avatarUrl: string) => {
    if (isAvataarConfig(avatarUrl)) {
      try {
        const config = JSON.parse(avatarUrl);
        return (
          <Avatar
            style={{ width: '100%', height: '100%' }}
            {...config}
          />
        );
      } catch (e) {
        // Fallback to a basic avatar if parsing fails
        return (
          <Avatar
            style={{ width: '100%', height: '100%' }}
            avatarStyle="Circle"
            topType="ShortHairShortRound"
            accessoriesType="Blank"
            hairColor="BrownDark"
            facialHairType="Blank"
            clotheType="BlazerShirt"
            eyeType="Default"
            eyebrowType="Default"
            mouthType="Default"
            skinColor="Light"
          />
        );
      }
    } else {
      // For regular image URLs
      return (
        <div 
          className="h-full w-full rounded-full bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />
      );
    }
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
                "h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden",
                selected === url 
                  ? "border-primary" 
                  : "border-transparent hover:border-primary/50"
              )}>
                {renderAvatar(url)}
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
