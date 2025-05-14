import { useState } from "react";
import Avatar from "avataaars";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// Define the avataar configuration type
export type AvataarConfig = {
  avatarStyle: 'Circle' | 'Transparent';
  topType: string;
  accessoriesType: string;
  hairColor: string;
  facialHairType: string;
  facialHairColor?: string;
  clotheType: string;
  clotheColor: string;
  graphicType?: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
  hatColor?: string; // Adding hatColor as optional property
};

// Define the props for the AvataarCustomizer component
interface AvataarCustomizerProps {
  initialConfig?: AvataarConfig;
  onSave: (config: AvataarConfig) => void;
  onCancel?: () => void;
}

// Available options for each customizable part
const avataarOptions = {
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

export const AvataarCustomizer = ({ initialConfig, onSave, onCancel }: AvataarCustomizerProps) => {
  // Default configuration with fallbacks to ensure all required properties are set
  const defaultConfig: AvataarConfig = {
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
    skinColor: 'Light',
    hatColor: 'Red' // Add default hatColor
  };

  // Initialize with provided config or default
  const [config, setConfig] = useState<AvataarConfig>(initialConfig || defaultConfig);
  const [activeTab, setActiveTab] = useState("topType");

  // Update a single property of the configuration
  const updateConfig = (property: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [property]: value
    }));
  };

  // Determine if we need to show certain options based on the current configuration
  const showHatColor = config.topType.includes('Hat') || config.topType.includes('Winter');
  const showFacialHairColor = config.facialHairType !== 'Blank';
  const showGraphicType = config.clotheType === 'GraphicShirt';

  // Create a modified config for rendering that includes all necessary properties
  const getAvatarProps = (customConfig: Partial<AvataarConfig> = {}) => {
    const baseProps = {
      style: { width: '100%', height: '100%' },
      ...config,
      ...customConfig
    };
    
    return baseProps;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
        <div className="h-60 w-60 md:h-72 md:w-72 mx-auto rounded-full bg-muted p-2 overflow-hidden">
          <Avatar
            {...getAvatarProps()}
          />
        </div>
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            className="w-full"
            onClick={() => onSave(config)}
          >
            Save Avatar
          </Button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1">
            <TabsTrigger value="topType">Head</TabsTrigger>
            <TabsTrigger value="facialHair">Facial Hair</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
            <TabsTrigger value="clothes">Clothes</TabsTrigger>
            <TabsTrigger value="face">Face</TabsTrigger>
          </TabsList>

          {/* Head Tab */}
          <TabsContent value="topType" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Hair Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {avataarOptions.topType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.topType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('topType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: type,
                            accessoriesType: 'Blank',
                            facialHairType: 'Blank'
                          })}
                        />
                        {config.topType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2">Hair Color</Label>
                <RadioGroup 
                  value={config.hairColor}
                  onValueChange={value => updateConfig('hairColor', value)}
                  className="grid grid-cols-5 gap-2"
                >
                  {avataarOptions.hairColor.map(color => (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <Label
                        htmlFor={`hair-${color}`}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                          config.hairColor === color ? "border-primary" : "border-transparent"
                        )}>
                          <div 
                            className="h-6 w-6 rounded-full" 
                            style={{ backgroundColor: colorToHex(color) }}
                          />
                        </div>
                        <div className="text-xs text-center mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </Label>
                      <RadioGroupItem value={color} id={`hair-${color}`} className="sr-only" />
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {showHatColor && (
                <div>
                  <Label className="block mb-2">Hat Color</Label>
                  <RadioGroup 
                    value={config.hatColor || 'Red'}
                    onValueChange={value => updateConfig('hatColor', value)}
                    className="grid grid-cols-5 gap-2"
                  >
                    {avataarOptions.hatColor.map(color => (
                      <div key={color} className="flex flex-col items-center gap-1">
                        <Label
                          htmlFor={`hat-${color}`}
                          className="cursor-pointer"
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                            config.hatColor === color ? "border-primary" : "border-transparent"
                          )}>
                            <div 
                              className="h-6 w-6 rounded-full" 
                              style={{ backgroundColor: colorToHex(color) }}
                            />
                          </div>
                          <div className="text-xs text-center mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</div>
                        </Label>
                        <RadioGroupItem value={color} id={`hat-${color}`} className="sr-only" />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div>
                <Label className="block mb-2">Skin Tone</Label>
                <RadioGroup 
                  value={config.skinColor}
                  onValueChange={value => updateConfig('skinColor', value)}
                  className="grid grid-cols-4 gap-2"
                >
                  {avataarOptions.skinColor.map(color => (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <Label
                        htmlFor={`skin-${color}`}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                          config.skinColor === color ? "border-primary" : "border-transparent"
                        )}>
                          <div 
                            className="h-8 w-8 rounded-full" 
                            style={{ backgroundColor: skinColorToHex(color) }}
                          />
                        </div>
                        <div className="text-xs text-center mt-1">{color}</div>
                      </Label>
                      <RadioGroupItem value={color} id={`skin-${color}`} className="sr-only" />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs content remain mostly the same */}
          {/* ... keep existing code (facial hair, accessories, clothes, face tabs) */}
          <TabsContent value="facialHair" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Facial Hair Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {avataarOptions.facialHairType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.facialHairType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('facialHairType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: config.topType,
                            accessoriesType: 'Blank',
                            facialHairType: type,
                            facialHairColor: config.facialHairColor || config.hairColor
                          })}
                        />
                        {config.facialHairType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {showFacialHairColor && (
                <div>
                  <Label className="block mb-2">Facial Hair Color</Label>
                  <RadioGroup 
                    value={config.facialHairColor || config.hairColor}
                    onValueChange={value => updateConfig('facialHairColor', value)}
                    className="grid grid-cols-4 gap-2"
                  >
                    {avataarOptions.facialHairColor.map(color => (
                      <div key={color} className="flex flex-col items-center gap-1">
                        <Label
                          htmlFor={`facial-${color}`}
                          className="cursor-pointer"
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                            (config.facialHairColor || config.hairColor) === color ? "border-primary" : "border-transparent"
                          )}>
                            <div 
                              className="h-6 w-6 rounded-full" 
                              style={{ backgroundColor: colorToHex(color) }}
                            />
                          </div>
                          <div className="text-xs text-center mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</div>
                        </Label>
                        <RadioGroupItem value={color} id={`facial-${color}`} className="sr-only" />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="max-h-96 overflow-y-auto">
            <div>
              <Label className="block mb-2">Accessories</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {avataarOptions.accessoriesType.map(type => (
                  <div 
                    key={type}
                    className={cn(
                      "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                      config.accessoriesType === type ? "border-primary bg-accent" : "border-border"
                    )}
                    onClick={() => updateConfig('accessoriesType', type)}
                  >
                    <div className="h-16 w-16 mx-auto relative">
                      <Avatar
                        {...getAvatarProps({
                          topType: 'ShortHairShortRound',
                          accessoriesType: type,
                          facialHairType: 'Blank'
                        })}
                      />
                      {config.accessoriesType === type && (
                        <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clothes" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Clothes Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {avataarOptions.clotheType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.clotheType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('clotheType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: 'NoHair',
                            accessoriesType: 'Blank',
                            facialHairType: 'Blank',
                            clotheType: type,
                            clotheColor: config.clotheColor,
                            graphicType: config.graphicType || 'Bat'
                          })}
                      />
                        {config.clotheType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2">Clothes Color</Label>
                <RadioGroup 
                  value={config.clotheColor}
                  onValueChange={value => updateConfig('clotheColor', value)}
                  className="grid grid-cols-5 gap-2"
                >
                  {avataarOptions.clotheColor.map(color => (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <Label
                        htmlFor={`clothe-${color}`}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                          config.clotheColor === color ? "border-primary" : "border-transparent"
                        )}>
                          <div 
                            className="h-6 w-6 rounded-full" 
                            style={{ backgroundColor: colorToHex(color) }}
                          />
                        </div>
                        <div className="text-xs text-center mt-1">{color.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </Label>
                      <RadioGroupItem value={color} id={`clothe-${color}`} className="sr-only" />
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {showGraphicType && (
                <div>
                  <Label className="block mb-2">Graphic</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {avataarOptions.graphicType.map(type => (
                      <div 
                        key={type}
                        className={cn(
                          "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                          config.graphicType === type ? "border-primary bg-accent" : "border-border"
                        )}
                        onClick={() => updateConfig('graphicType', type)}
                      >
                        <div className="h-16 w-16 mx-auto relative">
                          <Avatar
                            {...getAvatarProps({
                              topType: 'NoHair',
                              accessoriesType: 'Blank',
                              facialHairType: 'Blank',
                              clotheType: 'GraphicShirt',
                              clotheColor: config.clotheColor,
                              graphicType: type
                            })}
                          />
                          {config.graphicType === type && (
                            <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-center mt-1 truncate">{type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="face" className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label className="block mb-2">Eye Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {avataarOptions.eyeType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.eyeType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('eyeType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: 'NoHair',
                            accessoriesType: 'Blank',
                            facialHairType: 'Blank',
                            clotheType: 'BlazerShirt',
                            eyeType: type,
                            eyebrowType: 'Default',
                            mouthType: 'Default'
                          })}
                        />
                        {config.eyeType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2">Eyebrow Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {avataarOptions.eyebrowType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.eyebrowType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('eyebrowType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: 'NoHair',
                            accessoriesType: 'Blank',
                            facialHairType: 'Blank',
                            clotheType: 'BlazerShirt',
                            eyeType: 'Default',
                            eyebrowType: type,
                            mouthType: 'Default'
                          })}
                        />
                        {config.eyebrowType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2">Mouth Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {avataarOptions.mouthType.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "border rounded-md p-2 cursor-pointer transition-all hover:bg-accent",
                        config.mouthType === type ? "border-primary bg-accent" : "border-border"
                      )}
                      onClick={() => updateConfig('mouthType', type)}
                    >
                      <div className="h-16 w-16 mx-auto relative">
                        <Avatar
                          {...getAvatarProps({
                            topType: 'NoHair',
                            accessoriesType: 'Blank',
                            facialHairType: 'Blank',
                            clotheType: 'BlazerShirt',
                            eyeType: 'Default',
                            eyebrowType: 'Default',
                            mouthType: type
                          })}
                        />
                        {config.mouthType === type && (
                          <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper functions for colors remain the same
// ... keep existing code (colorToHex and skinColorToHex functions)
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

export default AvataarCustomizer;
