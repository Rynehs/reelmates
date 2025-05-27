import React, { useState, useRef } from 'react';
import Avatar from 'avataaars';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Keep Label for option titles
import { Card, CardContent } from '@/components/ui/card'; // Added from first code
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator'; // Added from first code
import { ScrollArea } from '@/components/ui/scroll-area'; // Added from first code
import { toast } from 'sonner'; // Added from first code
import { Download, Shuffle, Save } from 'lucide-react'; // Changed RotateCcw to Shuffle

// Define the AvatarConfig interface if not already defined globally or in another file
interface AvatarConfig {
  avatarStyle: 'Circle' | 'Transparent';
  topType: string;
  accessoriesType: string;
  hairColor: string;
  facialHairType: string;
  facialHairColor: string;
  clotheType: string;
  clotheColor: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
}

// Default avatar configuration - adapted from first code for UI consistency
const defaultAvatarConfig: AvatarConfig = {
  avatarStyle: 'Circle',
  topType: 'LongHairMiaWallace',
  accessoriesType: 'Prescription02',
  hairColor: 'Brown',
  facialHairType: 'Blank',
  facialHairColor: 'Black',
  clotheType: 'Hoodie',
  clotheColor: 'PastelBlue',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Smile',
  skinColor: 'Light'
};

// Option groups for the customizer - retained from second code for self-containment
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
  const avatarRef = useRef<HTMLDivElement>(null); // Used for download functionality

  const randomizeAvatar = () => {
    const randomOption = <T extends string>(options: { value: T }[]): T => {
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex].value;
    };

    const newConfig: AvatarConfig = {
      avatarStyle: randomOption(optionGroups.avatarStyle),
      topType: randomOption(optionGroups.topType),
      accessoriesType: randomOption(optionGroups.accessoriesType),
      hairColor: randomOption(optionGroups.hairColor),
      facialHairType: randomOption(optionGroups.facialHairType),
      facialHairColor: randomOption(optionGroups.facialHairColor),
      clotheType: randomOption(optionGroups.clotheType),
      clotheColor: randomOption(optionGroups.clotheColor),
      eyeType: randomOption(optionGroups.eyeType),
      eyebrowType: randomOption(optionGroups.eyebrowType),
      mouthType: randomOption(optionGroups.mouthType),
      skinColor: randomOption(optionGroups.skinColor)
    };

    setAvatarConfig(newConfig);
    toast.success('Avatar randomized successfully!'); // Integrated toast
  };

  const downloadAvatar = () => {
    if (!avatarRef.current) {
      toast.error('Could not find avatar to download.');
      return;
    }

    const svg = avatarRef.current.querySelector('svg');
    if (!svg) {
      toast.error('SVG element not found.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;

    const img = new Image();
    // Using Blob for more robust SVG to image conversion
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Canvas context not available.');
        return;
      }

      // Fill background with white for transparency if avatarStyle is 'Transparent'
      if (avatarConfig.avatarStyle === 'Transparent') {
        ctx.fillStyle = 'transparent'; // Use transparent for actual transparency
      } else {
        ctx.fillStyle = 'white';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'my-avatar.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url); // Clean up the URL object

      toast.success('Avatar downloaded successfully!'); // Integrated toast
    };

    img.onerror = () => {
      toast.error('Failed to load avatar for download.');
    };

    img.src = url;
  };

  // No explicit handleReset needed, onCancel covers it.

  // Update a specific property of the avatar configuration
  const updateConfig = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Avatar Preview Section - now within a Card */}
        <Card className="flex-1 min-w-[300px]">
          <CardContent className="flex items-center justify-center p-6">
            <div
              ref={avatarRef} // Use ref here for download
              className="avatar-wrapper bg-accent p-8 rounded-full shadow-lg"
              style={{ width: '280px', height: '280px' }}
            >
              {/* No need for #avatar-svg id wrapper if using useRef directly on the container */}
              <Avatar
                style={{ width: '100%', height: '100%' }}
                {...avatarConfig} // Spread avatarConfig directly
              />
            </div>
          </CardContent>
        </Card>

        {/* Customization Options Section */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={randomizeAvatar}
            >
              <Shuffle className="mr-2 h-4 w-4" /> Randomize
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={downloadAvatar}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Tabbed Customization */}
          <Tabs defaultValue="head" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6 bg-muted/50">
              <TabsTrigger value="head">Head</TabsTrigger>
              <TabsTrigger value="face">Face</TabsTrigger>
              <TabsTrigger value="clothes">Clothes</TabsTrigger>
            </TabsList>

            {/* Use ScrollArea for tab content */}
            <ScrollArea className="h-[400px] mt-2 pr-4">
              <TabsContent value="head" className="mt-0 space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Hair Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {optionGroups.topType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.topType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('topType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Hair Color</Label>
                  {/* Adjusted grid cols for color options to be more compact like original */}
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {optionGroups.hairColor.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.hairColor === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('hairColor', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Skin Tone</Label>
                  {/* Adjusted grid cols for color options to be more compact like original */}
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                    {optionGroups.skinColor.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.skinColor === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('skinColor', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Avatar Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {optionGroups.avatarStyle.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.avatarStyle === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('avatarStyle', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="face" className="mt-0 space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Accessories</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {optionGroups.accessoriesType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.accessoriesType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('accessoriesType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Facial Hair</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {optionGroups.facialHairType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.facialHairType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('facialHairType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {avatarConfig.facialHairType !== 'Blank' && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Facial Hair Color</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {optionGroups.facialHairColor.map((option) => (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={avatarConfig.facialHairColor === option.value ? "default" : "outline"}
                          className="h-auto py-1 px-2 text-xs rounded-full"
                          onClick={() => updateConfig('facialHairColor', option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-3 block">Eyes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {optionGroups.eyeType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.eyeType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('eyeType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Eyebrows</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {optionGroups.eyebrowType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.eyebrowType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('eyebrowType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Mouth</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {optionGroups.mouthType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.mouthType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('mouthType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clothes" className="mt-0 space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Clothes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {optionGroups.clotheType.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.clotheType === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('clotheType', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Clothes Color</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {optionGroups.clotheColor.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={avatarConfig.clotheColor === option.value ? "default" : "outline"}
                        className="h-auto py-1 px-2 text-xs rounded-full"
                        onClick={() => updateConfig('clotheColor', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Save/Cancel Buttons - added to the bottom of the right panel */}
          <div className="flex gap-2 justify-end mt-4"> {/* Aligned to end for a cleaner look */}
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="default"
              onClick={() => onSave(avatarConfig)}
              className="gap-1"
            >
              <Save className="h-4 w-4" />
              Save Avatar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
