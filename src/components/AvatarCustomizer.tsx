
import React, { useState, useEffect } from 'react';
import Avatar from 'avataaars';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Save, RotateCcw } from 'lucide-react';

// Default avatar configuration
const defaultAvatarConfig: AvatarConfig = {
  avatarStyle: 'Circle',
  topType: 'ShortHairShortRound',
  accessoriesType: 'Blank',
  hairColor: 'BrownDark',
  facialHairType: 'Blank',
  facialHairColor: 'Auburn',
  clotheType: 'BlazerShirt',
  clotheColor: 'Blue01',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Default',
  skinColor: 'Light'
};

// Option groups for the customizer
const optionGroups = {
  topType: [
    { value: 'NoHair', label: 'No Hair' },
    { value: 'Eyepatch', label: 'Eyepatch' },
    { value: 'Hat', label: 'Hat' },
    { value: 'Hijab', label: 'Hijab' },
    { value: 'Turban', label: 'Turban' },
    { value: 'WinterHat1', label: 'Winter Hat' },
    { value: 'WinterHat2', label: 'Beanie' },
    { value: 'WinterHat3', label: 'Snowman Beanie' },
    { value: 'WinterHat4', label: 'Pom-pom Hat' },
    { value: 'LongHairBigHair', label: 'Long Big Hair' },
    { value: 'LongHairBob', label: 'Long Bob' },
    { value: 'LongHairBun', label: 'Long Hair Bun' },
    { value: 'LongHairCurly', label: 'Long Curly Hair' },
    { value: 'LongHairCurvy', label: 'Long Curvy Hair' },
    { value: 'LongHairDreads', label: 'Dreadlocks' },
    { value: 'LongHairFrida', label: 'Frida Style' },
    { value: 'LongHairFro', label: 'Afro' },
    { value: 'LongHairFroBand', label: 'Afro with Band' },
    { value: 'LongHairNotTooLong', label: 'Medium Length Hair' },
    { value: 'LongHairShavedSides', label: 'Shaved Sides' },
    { value: 'LongHairMiaWallace', label: 'Mia Wallace Style' },
    { value: 'LongHairStraight', label: 'Long Straight Hair' },
    { value: 'LongHairStraight2', label: 'Long Straight Hair 2' },
    { value: 'LongHairStraightStrand', label: 'Straight with Strand' },
    { value: 'ShortHairDreads01', label: 'Short Dreads 1' },
    { value: 'ShortHairDreads02', label: 'Short Dreads 2' },
    { value: 'ShortHairFrizzle', label: 'Frizzle Hair' },
    { value: 'ShortHairShaggyMullet', label: 'Shaggy Mullet' },
    { value: 'ShortHairShortCurly', label: 'Short Curly Hair' },
    { value: 'ShortHairShortFlat', label: 'Short Flat Hair' },
    { value: 'ShortHairShortRound', label: 'Short Round Hair' },
    { value: 'ShortHairShortWaved', label: 'Short Waved Hair' },
    { value: 'ShortHairSides', label: 'Short Hair Sides' },
    { value: 'ShortHairTheCaesar', label: 'The Caesar' },
    { value: 'ShortHairTheCaesarSidePart', label: 'Caesar Side Part' }
  ],
  accessoriesType: [
    { value: 'Blank', label: 'None' },
    { value: 'Kurt', label: 'Kurt Glasses' },
    { value: 'Prescription01', label: 'Round Glasses' },
    { value: 'Prescription02', label: 'Square Glasses' },
    { value: 'Round', label: 'Round Sunglasses' },
    { value: 'Sunglasses', label: 'Classic Sunglasses' },
    { value: 'Wayfarers', label: 'Wayfarers' }
  ],
  hairColor: [
    { value: 'Auburn', label: 'Auburn' },
    { value: 'Black', label: 'Black' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'BlondeGolden', label: 'Golden Blonde' },
    { value: 'Brown', label: 'Brown' },
    { value: 'BrownDark', label: 'Dark Brown' },
    { value: 'PastelPink', label: 'Pastel Pink' },
    { value: 'Platinum', label: 'Platinum' },
    { value: 'Red', label: 'Red' },
    { value: 'SilverGray', label: 'Silver Gray' }
  ],
  facialHairType: [
    { value: 'Blank', label: 'None' },
    { value: 'BeardMedium', label: 'Medium Beard' },
    { value: 'BeardLight', label: 'Light Beard' },
    { value: 'BeardMajestic', label: 'Majestic Beard' },
    { value: 'MoustacheFancy', label: 'Fancy Moustache' },
    { value: 'MoustacheMagnum', label: 'Magnum Moustache' }
  ],
  facialHairColor: [
    { value: 'Auburn', label: 'Auburn' },
    { value: 'Black', label: 'Black' },
    { value: 'Blonde', label: 'Blonde' },
    { value: 'BlondeGolden', label: 'Golden Blonde' },
    { value: 'Brown', label: 'Brown' },
    { value: 'BrownDark', label: 'Dark Brown' },
    { value: 'Platinum', label: 'Platinum' },
    { value: 'Red', label: 'Red' }
  ],
  clotheType: [
    { value: 'BlazerShirt', label: 'Blazer with Shirt' },
    { value: 'BlazerSweater', label: 'Blazer with Sweater' },
    { value: 'CollarSweater', label: 'Collar Sweater' },
    { value: 'GraphicShirt', label: 'Graphic Shirt' },
    { value: 'Hoodie', label: 'Hoodie' },
    { value: 'Overall', label: 'Overall' },
    { value: 'ShirtCrewNeck', label: 'Crew Neck Shirt' },
    { value: 'ShirtScoopNeck', label: 'Scoop Neck Shirt' },
    { value: 'ShirtVNeck', label: 'V Neck Shirt' }
  ],
  clotheColor: [
    { value: 'Black', label: 'Black' },
    { value: 'Blue01', label: 'Blue' },
    { value: 'Blue02', label: 'Light Blue' },
    { value: 'Blue03', label: 'Dark Blue' },
    { value: 'Gray01', label: 'Gray' },
    { value: 'Gray02', label: 'Dark Gray' },
    { value: 'Heather', label: 'Heather' },
    { value: 'PastelBlue', label: 'Pastel Blue' },
    { value: 'PastelGreen', label: 'Pastel Green' },
    { value: 'PastelOrange', label: 'Pastel Orange' },
    { value: 'PastelRed', label: 'Pastel Red' },
    { value: 'PastelYellow', label: 'Pastel Yellow' },
    { value: 'Pink', label: 'Pink' },
    { value: 'Red', label: 'Red' },
    { value: 'White', label: 'White' }
  ],
  eyeType: [
    { value: 'Close', label: 'Closed' },
    { value: 'Cry', label: 'Crying' },
    { value: 'Default', label: 'Default' },
    { value: 'Dizzy', label: 'Dizzy' },
    { value: 'EyeRoll', label: 'Eye Roll' },
    { value: 'Happy', label: 'Happy' },
    { value: 'Hearts', label: 'Hearts' },
    { value: 'Side', label: 'Side' },
    { value: 'Squint', label: 'Squint' },
    { value: 'Surprised', label: 'Surprised' },
    { value: 'Wink', label: 'Wink' },
    { value: 'WinkWacky', label: 'Wacky Wink' }
  ],
  eyebrowType: [
    { value: 'Angry', label: 'Angry' },
    { value: 'AngryNatural', label: 'Angry Natural' },
    { value: 'Default', label: 'Default' },
    { value: 'DefaultNatural', label: 'Default Natural' },
    { value: 'FlatNatural', label: 'Flat Natural' },
    { value: 'RaisedExcited', label: 'Raised Excited' },
    { value: 'RaisedExcitedNatural', label: 'Raised Excited Natural' },
    { value: 'SadConcerned', label: 'Sad Concerned' },
    { value: 'SadConcernedNatural', label: 'Sad Concerned Natural' },
    { value: 'UnibrowNatural', label: 'Unibrow Natural' },
    { value: 'UpDown', label: 'Up Down' },
    { value: 'UpDownNatural', label: 'Up Down Natural' }
  ],
  mouthType: [
    { value: 'Concerned', label: 'Concerned' },
    { value: 'Default', label: 'Default' },
    { value: 'Disbelief', label: 'Disbelief' },
    { value: 'Eating', label: 'Eating' },
    { value: 'Grimace', label: 'Grimace' },
    { value: 'Sad', label: 'Sad' },
    { value: 'ScreamOpen', label: 'Scream Open' },
    { value: 'Serious', label: 'Serious' },
    { value: 'Smile', label: 'Smile' },
    { value: 'Tongue', label: 'Tongue' },
    { value: 'Twinkle', label: 'Twinkle' },
    { value: 'Vomit', label: 'Vomit' }
  ],
  skinColor: [
    { value: 'Tanned', label: 'Tanned' },
    { value: 'Yellow', label: 'Yellow' },
    { value: 'Pale', label: 'Pale' },
    { value: 'Light', label: 'Light' },
    { value: 'Brown', label: 'Brown' },
    { value: 'DarkBrown', label: 'Dark Brown' },
    { value: 'Black', label: 'Black' }
  ],
  avatarStyle: [
    { value: 'Circle', label: 'Circle' },
    { value: 'Transparent', label: 'Transparent' }
  ]
};

interface AvatarCustomizerProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel?: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onSave,
  onCancel
}) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(
    initialConfig || defaultAvatarConfig
  );

  // Reset to initial config or default
  const handleReset = () => {
    setAvatarConfig(initialConfig || defaultAvatarConfig);
  };

  // Update a specific property of the avatar configuration
  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Create a select component for a specific feature
  const FeatureSelect = ({
    feature,
    label,
    options
  }: {
    feature: keyof AvatarConfig;
    label: string;
    options: { value: string; label: string }[];
  }) => (
    <div className="space-y-2">
      <Label htmlFor={feature}>{label}</Label>
      <Select
        value={avatarConfig[feature]}
        onValueChange={(value) => updateConfig(feature, value)}
      >
        <SelectTrigger id={feature}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center justify-start">
        <div className="w-48 h-48 md:w-64 md:h-64 border rounded-full overflow-hidden flex items-center justify-center bg-white">
          <Avatar
            style={{ width: '100%', height: '100%' }}
            avatarStyle={avatarConfig.avatarStyle}
            topType={avatarConfig.topType}
            accessoriesType={avatarConfig.accessoriesType}
            hairColor={avatarConfig.hairColor}
            facialHairType={avatarConfig.facialHairType}
            facialHairColor={avatarConfig.facialHairColor}
            clotheType={avatarConfig.clotheType}
            clotheColor={avatarConfig.clotheColor}
            eyeType={avatarConfig.eyeType}
            eyebrowType={avatarConfig.eyebrowType}
            mouthType={avatarConfig.mouthType}
            skinColor={avatarConfig.skinColor}
          />
        </div>
        
        <div className="mt-4 space-x-2 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSave(avatarConfig)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          {onCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="col-span-1 md:col-span-2">
        <Tabs defaultValue="head">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="head">Head</TabsTrigger>
            <TabsTrigger value="face">Face</TabsTrigger>
            <TabsTrigger value="clothes">Clothes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="head" className="space-y-4">
            <FeatureSelect 
              feature="topType" 
              label="Hair Style" 
              options={optionGroups.topType} 
            />
            <FeatureSelect 
              feature="hairColor" 
              label="Hair Color" 
              options={optionGroups.hairColor} 
            />
            <FeatureSelect 
              feature="skinColor" 
              label="Skin Tone" 
              options={optionGroups.skinColor} 
            />
            <FeatureSelect 
              feature="avatarStyle" 
              label="Avatar Style" 
              options={optionGroups.avatarStyle} 
            />
          </TabsContent>
          
          <TabsContent value="face" className="space-y-4">
            <FeatureSelect 
              feature="accessoriesType" 
              label="Accessories" 
              options={optionGroups.accessoriesType} 
            />
            <FeatureSelect 
              feature="facialHairType" 
              label="Facial Hair" 
              options={optionGroups.facialHairType} 
            />
            {avatarConfig.facialHairType !== 'Blank' && (
              <FeatureSelect 
                feature="facialHairColor" 
                label="Facial Hair Color" 
                options={optionGroups.facialHairColor} 
              />
            )}
            <FeatureSelect 
              feature="eyeType" 
              label="Eyes" 
              options={optionGroups.eyeType} 
            />
            <FeatureSelect 
              feature="eyebrowType" 
              label="Eyebrows" 
              options={optionGroups.eyebrowType} 
            />
            <FeatureSelect 
              feature="mouthType" 
              label="Mouth" 
              options={optionGroups.mouthType} 
            />
          </TabsContent>
          
          <TabsContent value="clothes" className="space-y-4">
            <FeatureSelect 
              feature="clotheType" 
              label="Clothes" 
              options={optionGroups.clotheType} 
            />
            <FeatureSelect 
              feature="clotheColor" 
              label="Clothes Color" 
              options={optionGroups.clotheColor} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
