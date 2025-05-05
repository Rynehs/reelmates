
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AvataarRenderer from "./AvataarRenderer";
import { AvataarConfig } from "./AvataarCustomizer";

// For backward compatibility
export const isPredefinedAvatar = (path: string): boolean => {
  return false; // We no longer use predefined avatar paths
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

// Create some sample avataar configurations for predefined options
const predefinedAvatars: AvataarConfig[] = [
  {
    avatarStyle: 'Circle',
    topType: 'ShortHairShortRound',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    clotheType: 'BlazerShirt',
    clotheColor: 'Blue01',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light'
  },
  {
    avatarStyle: 'Circle',
    topType: 'LongHairMiaWallace',
    accessoriesType: 'Prescription02',
    hairColor: 'BlondeGolden',
    facialHairType: 'Blank',
    clotheType: 'GraphicShirt',
    clotheColor: 'PastelYellow',
    graphicType: 'Deer',
    eyeType: 'Happy',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    skinColor: 'Pale'
  },
  {
    avatarStyle: 'Circle',
    topType: 'ShortHairTheCaesar',
    accessoriesType: 'Sunglasses',
    hairColor: 'Black',
    facialHairType: 'BeardMedium',
    facialHairColor: 'Black',
    clotheType: 'Hoodie',
    clotheColor: 'Red',
    eyeType: 'Surprised',
    eyebrowType: 'RaisedExcited',
    mouthType: 'Serious',
    skinColor: 'Brown'
  },
  {
    avatarStyle: 'Circle',
    topType: 'WinterHat1',
    accessoriesType: 'Round',
    hairColor: 'Red',
    facialHairType: 'Blank',
    clotheType: 'ShirtScoopNeck',
    clotheColor: 'PastelRed',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Tanned'
  }
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export const AvatarPicker = ({ selectedAvatar, onSelect }: AvatarPickerProps) => {
  // Parse the selected avatar if it's a JSON string
  const getSelectedAvatarIndex = (): number => {
    try {
      if (!selectedAvatar) return -1;
      
      const selectedConfig = JSON.parse(selectedAvatar);
      // Find if this matches any of our predefined avatars
      return predefinedAvatars.findIndex(avatar => 
        avatar.topType === selectedConfig.topType &&
        avatar.hairColor === selectedConfig.hairColor &&
        avatar.skinColor === selectedConfig.skinColor
      );
    } catch (e) {
      return -1;
    }
  };
  
  const selectedIndex = getSelectedAvatarIndex();

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedIndex >= 0 ? selectedIndex.toString() : ""}
        onValueChange={(value) => {
          const index = parseInt(value);
          if (!isNaN(index) && index >= 0 && index < predefinedAvatars.length) {
            onSelect(JSON.stringify(predefinedAvatars[index]));
          }
        }}
        className="grid grid-cols-4 gap-4"
      >
        {predefinedAvatars.map((avatar, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Label
              htmlFor={`avatar-${index}`}
              className={cn(
                "cursor-pointer flex flex-col items-center gap-2",
                selectedIndex === index ? "ring-2 ring-primary" : ""
              )}
            >
              <div className="h-16 w-16 rounded-full overflow-hidden border">
                <AvataarRenderer {...avatar} />
              </div>
            </Label>
            <RadioGroupItem
              value={index.toString()}
              id={`avatar-${index}`}
              className="sr-only"
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AvatarPicker;
