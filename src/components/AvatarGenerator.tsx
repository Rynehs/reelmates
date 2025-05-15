
import React, { useState } from 'react';
import Avatar from 'avataaars';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Check, Circle, Palette } from 'lucide-react';

// Define the avatar configuration type
export type AvatarConfig = {
  avatarStyle: 'Circle' | 'Transparent';
  topType: string;
  accessoriesType: string;
  hairColor: string;
  facialHairType: string;
  facialHairColor: string;
  clotheType: string;
  clotheColor: string;
  graphicType?: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
  hatColor?: string;
};

// Available options for each customizable part
const avatarOptions = {
  topType: [
    'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3',
    'WinterHat4', 'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 
    'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro', 'LongHairFroBand',
    'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairMiaWallace', 'LongHairStraight', 
    'LongHairStraight2', 'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02',
    'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly', 'ShortHairShortFlat',
    'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides', 'ShortHairTheCaesar',
    'ShortHairTheCaesarSidePart'
  ],
  accessoriesType: [
    'Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers'
  ],
  hairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 
    'Platinum', 'Red', 'SilverGray'
  ],
  hatColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 
    'PastelGreen', 'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'
  ],
  facialHairType: [
    'Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy', 'MoustacheMagnum'
  ],
  facialHairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'Platinum', 'Red'
  ],
  clotheType: [
    'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall',
    'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck'
  ],
  clotheColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue',
    'PastelGreen', 'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'
  ],
  graphicType: [
    'Bat', 'Cumbia', 'Deer', 'Diamond', 'Hola', 'Pizza', 'Resist', 'Selena', 'Bear',
    'SkullOutline', 'Skull'
  ],
  eyeType: [
    'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint',
    'Surprised', 'Wink', 'WinkWacky'
  ],
  eyebrowType: [
    'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited',
    'RaisedExcitedNatural', 'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown',
    'UpDownNatural'
  ],
  mouthType: [
    'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious',
    'Smile', 'Tongue', 'Twinkle', 'Vomit'
  ],
  skinColor: [
    'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'
  ]
};

interface AvatarGeneratorProps {
  initialConfig?: AvatarConfig;
  onSave?: (config: AvatarConfig) => void;
}

// Helper function to convert color names to hex values
const colorToHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'Auburn': '#A52A2A',
    'Black': '#000000',
    'Blonde': '#FFFF00',
    'BlondeGolden': '#FFD700',
    'Brown': '#A52A2A',
    'BrownDark': '#5D4037',
    'PastelPink': '#FFB6C1',
    'Platinum': '#E5E4E2',
    'Red': '#FF0000',
    'SilverGray': '#C0C0C0',
    'Blue01': '#65C9FF',
    'Blue02': '#5199E4',
    'Blue03': '#25557C',
    'Gray01': '#E6E6E6',
    'Gray02': '#929598',
    'Heather': '#3C4F5C',
    'PastelBlue': '#A7D0FF',
    'PastelGreen': '#B1E2C3',
    'PastelOrange': '#FFCC80',
    'PastelRed': '#FFABAB',
    'PastelYellow': '#FFFFB1',
    'Pink': '#FF88BC',
    'White': '#FFFFFF',
  };

  return colorMap[colorName] || '#000000';
};

// Helper function to convert skin color names to hex values
const skinColorToHex = (colorName: string): string => {
  const skinColorMap: Record<string, string> = {
    'Tanned': '#FD9841',
    'Yellow': '#F8D25C',
    'Pale': '#FFDBB4',
    'Light': '#EDB98A',
    'Brown': '#D08B5B',
    'DarkBrown': '#AE5D29',
    'Black': '#614335'
  };

  return skinColorMap[colorName] || '#EDB98A';
};

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ initialConfig, onSave }) => {
  // Default configuration with fallbacks
  const defaultConfig: AvatarConfig = {
    avatarStyle: 'Circle',
    topType: 'ShortHairShortRound',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    facialHairColor: 'BrownDark',
    clotheType: 'BlazerShirt',
    clotheColor: 'Blue01',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light',
    hatColor: 'Black'
  };

  // Initialize with provided config or default
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultConfig);
  const [activeTab, setActiveTab] = useState("appearance");

  // Update a single property of the configuration
  const updateConfig = (property: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };

  // Determine if we need to show certain options based on the current configuration
  const showHatColor = config.topType.includes('Hat') || config.topType.includes('Winter');
  const showFacialHairColor = config.facialHairType !== 'Blank';
  const showGraphicType = config.clotheType === 'GraphicShirt';

  // Handle save button click
  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full p-4">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 w-full lg:w-1/3">
        <div className="h-60 w-60 lg:h-72 lg:w-72 rounded-full bg-background border p-2 overflow-hidden">
          <Avatar
            style={{ width: '100%', height: '100%' }}
            {...config}
          />
        </div>
        
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setConfig(defaultConfig)}
          >
            Reset
          </Button>
          {onSave && (
            <Button 
              className="w-full"
              onClick={handleSave}
            >
              Save Avatar
            </Button>
          )}
        </div>

        {/* Avatar Style Selection */}
        <div className="w-full">
          <Label className="block mb-2">Avatar Style</Label>
          <div className="flex gap-4 justify-center">
            <div
              className={cn(
                "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent w-1/2 text-center",
                config.avatarStyle === 'Circle' ? "border-primary bg-accent" : "border-border"
              )}
              onClick={() => updateConfig('avatarStyle', 'Circle')}
            >
              Circle
            </div>
            <div
              className={cn(
                "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent w-1/2 text-center",
                config.avatarStyle === 'Transparent' ? "border-primary bg-accent" : "border-border"
              )}
              onClick={() => updateConfig('avatarStyle', 'Transparent')}
            >
              Transparent
            </div>
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="facial">Facial Features</TabsTrigger>
            <TabsTrigger value="clothes">Clothes</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 max-h-[500px] overflow-y-auto p-2">
            {/* Skin Color */}
            <div>
              <Label className="block mb-2">Skin Tone</Label>
              <div className="grid grid-cols-7 gap-3">
                {avatarOptions.skinColor.map(color => (
                  <div 
                    key={color}
                    className={cn(
                      "flex flex-col items-center",
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all",
                        config.skinColor === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: skinColorToHex(color) }}
                      onClick={() => updateConfig('skinColor', color)}
                    >
                      {config.skinColor === color && (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </div>
                    <span className="text-xs mt-1">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top/Hair Type */}
            <div>
              <Label className="block mb-2">Hair Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {avatarOptions.topType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-3 cursor-pointer transition-all hover:bg-accent",
                      config.topType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('topType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType={type}
                        hairColor={config.hairColor}
                        accessoriesType='Blank'
                        facialHairType='Blank'
                        clotheType='BlazerShirt'
                        eyeType='Default'
                        eyebrowType='Default'
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-2 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div>
              <Label className="block mb-2">Hair Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.hairColor.map(color => (
                  <div 
                    key={color}
                    className={cn(
                      "flex flex-col items-center",
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all",
                        config.hairColor === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: colorToHex(color) }}
                      onClick={() => updateConfig('hairColor', color)}
                    >
                      {config.hairColor === color && (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </div>
                    <span className="text-xs mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hat Color (conditional) */}
            {showHatColor && (
              <div>
                <Label className="block mb-2">Hat Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.hatColor.map(color => (
                    <div 
                      key={color}
                      className={cn(
                        "flex flex-col items-center",
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all",
                          config.hatColor === color ? "border-primary" : "border-transparent"
                        )}
                        style={{ backgroundColor: colorToHex(color) }}
                        onClick={() => updateConfig('hatColor', color)}
                      >
                        {config.hatColor === color && (
                          <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                      </div>
                      <span className="text-xs mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Facial Features Tab */}
          <TabsContent value="facial" className="space-y-6 max-h-[500px] overflow-y-auto p-2">
            {/* Eyes Type */}
            <div>
              <Label className="block mb-2">Eye Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {avatarOptions.eyeType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.eyeType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('eyeType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType='Blank'
                        facialHairType='Blank'
                        clotheType='BlazerShirt'
                        eyeType={type}
                        eyebrowType='Default'
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eyebrow Type */}
            <div>
              <Label className="block mb-2">Eyebrow Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {avatarOptions.eyebrowType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.eyebrowType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('eyebrowType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType='Blank'
                        facialHairType='Blank'
                        clotheType='BlazerShirt'
                        eyeType='Default'
                        eyebrowType={type}
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mouth Type */}
            <div>
              <Label className="block mb-2">Mouth Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {avatarOptions.mouthType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.mouthType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('mouthType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType='Blank'
                        facialHairType='Blank'
                        clotheType='BlazerShirt'
                        eyeType='Default'
                        eyebrowType='Default'
                        mouthType={type}
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facial Hair Type */}
            <div>
              <Label className="block mb-2">Facial Hair</Label>
              <div className="grid grid-cols-3 gap-2">
                {avatarOptions.facialHairType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.facialHairType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('facialHairType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType='Blank'
                        facialHairType={type}
                        facialHairColor={config.facialHairColor}
                        clotheType='BlazerShirt'
                        eyeType='Default'
                        eyebrowType='Default'
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facial Hair Color (conditional) */}
            {showFacialHairColor && (
              <div>
                <Label className="block mb-2">Facial Hair Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarOptions.facialHairColor.map(color => (
                    <div 
                      key={color}
                      className={cn(
                        "flex flex-col items-center",
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all",
                          config.facialHairColor === color ? "border-primary" : "border-transparent"
                        )}
                        style={{ backgroundColor: colorToHex(color) }}
                        onClick={() => updateConfig('facialHairColor', color)}
                      >
                        {config.facialHairColor === color && (
                          <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                      </div>
                      <span className="text-xs mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Clothes Tab */}
          <TabsContent value="clothes" className="space-y-6 max-h-[500px] overflow-y-auto p-2">
            {/* Clothes Type */}
            <div>
              <Label className="block mb-2">Clothes Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {avatarOptions.clotheType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.clotheType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('clotheType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType='Blank'
                        facialHairType='Blank'
                        clotheType={type}
                        clotheColor={config.clotheColor}
                        graphicType={config.graphicType || 'Bat'}
                        eyeType='Default'
                        eyebrowType='Default'
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clothes Color */}
            <div>
              <Label className="block mb-2">Clothes Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.clotheColor.map(color => (
                  <div 
                    key={color}
                    className={cn(
                      "flex flex-col items-center",
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all",
                        config.clotheColor === color ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: colorToHex(color) }}
                      onClick={() => updateConfig('clotheColor', color)}
                    >
                      {config.clotheColor === color && (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </div>
                    <span className="text-xs mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphic (conditional) */}
            {showGraphicType && (
              <div>
                <Label className="block mb-2">T-Shirt Graphic</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {avatarOptions.graphicType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.graphicType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('graphicType', type)}
                    >
                      <div className="h-14 w-14 mx-auto relative">
                        <Avatar
                          style={{ width: '100%', height: '100%' }}
                          avatarStyle='Circle'
                          topType='NoHair'
                          accessoriesType='Blank'
                          facialHairType='Blank'
                          clotheType='GraphicShirt'
                          clotheColor={config.clotheColor}
                          graphicType={type}
                          eyeType='Default'
                          eyebrowType='Default'
                          mouthType='Default'
                          skinColor={config.skinColor}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Accessories Tab */}
          <TabsContent value="accessories" className="max-h-[500px] overflow-y-auto p-2">
            {/* Accessories Type */}
            <div>
              <Label className="block mb-2">Accessories</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {avatarOptions.accessoriesType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.accessoriesType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('accessoriesType', type)}
                  >
                    <div className="h-14 w-14 mx-auto relative">
                      <Avatar
                        style={{ width: '100%', height: '100%' }}
                        avatarStyle='Circle'
                        topType='NoHair'
                        accessoriesType={type}
                        facialHairType='Blank'
                        clotheType='BlazerShirt'
                        eyeType='Default'
                        eyebrowType='Default'
                        mouthType='Default'
                        skinColor={config.skinColor}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AvatarGenerator;
