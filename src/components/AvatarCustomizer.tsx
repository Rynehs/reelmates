
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Avatar from "avataaars";

interface AvatarCustomizerProps {
  onSelect: (avatarConfig: string) => void;
  initialConfig?: string;
}

export const AvatarCustomizer = ({ onSelect, initialConfig }: AvatarCustomizerProps) => {
  // Parse initial config if provided
  const parseInitialConfig = () => {
    if (initialConfig) {
      try {
        return JSON.parse(initialConfig);
      } catch (e) {
        console.error("Error parsing initial config:", e);
      }
    }
    return {
      avatarStyle: 'Circle',
      topType: 'LongHairStraight',
      accessoriesType: 'Blank',
      hairColor: 'BrownDark',
      facialHairType: 'Blank',
      facialHairColor: 'BrownDark',
      clotheType: 'BlazerShirt',
      clotheColor: 'Blue03',
      eyeType: 'Default',
      eyebrowType: 'Default',
      mouthType: 'Default',
      skinColor: 'Light',
      graphicType: 'Bat'
    };
  };

  const [config, setConfig] = useState(parseInitialConfig());

  // Configuration options
  const options = {
    avatarStyle: ['Circle', 'Transparent'],
    topType: [
      'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
      'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads',
      'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides',
      'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand',
      'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet',
      'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
      'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart'
    ],
    accessoriesType: [
      'Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers'
    ],
    hairColor: [
      'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'
    ],
    facialHairType: [
      'Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy', 'MoustacheMagnum'
    ],
    facialHairColor: [
      'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'
    ],
    clotheType: [
      'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtCrewNeck',
      'ShirtScoopNeck', 'ShirtVNeck'
    ],
    clotheColor: [
      'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 'PastelGreen',
      'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'
    ],
    eyeType: [
      'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised',
      'Wink', 'WinkWacky'
    ],
    eyebrowType: [
      'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited',
      'RaisedExcitedNatural', 'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown',
      'UpDownNatural'
    ],
    mouthType: [
      'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile',
      'Tongue', 'Twinkle', 'Vomit'
    ],
    skinColor: [
      'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'
    ],
    graphicType: [
      'Bat', 'Cumbia', 'Deer', 'Diamond', 'Hola', 'Pizza', 'Resist', 'Selena', 'Bear', 'SkullOutline', 'Skull'
    ]
  };

  const updateConfig = (key: string, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSave = () => {
    const configString = JSON.stringify(config);
    onSelect(configString);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Customize Your Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar Preview */}
          <div className="flex-shrink-0 lg:w-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 flex items-center justify-center border rounded-lg bg-gray-50">
                <Avatar
                  style={{ width: '180px', height: '180px' }}
                  {...config}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Avatar
              </Button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="avatarStyle">Avatar Style</Label>
              <Select value={config.avatarStyle} onValueChange={(value) => updateConfig('avatarStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.avatarStyle.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topType">Hair Style</Label>
              <Select value={config.topType} onValueChange={(value) => updateConfig('topType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.topType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hairColor">Hair Color</Label>
              <Select value={config.hairColor} onValueChange={(value) => updateConfig('hairColor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.hairColor.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accessoriesType">Accessories</Label>
              <Select value={config.accessoriesType} onValueChange={(value) => updateConfig('accessoriesType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.accessoriesType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="facialHairType">Facial Hair</Label>
              <Select value={config.facialHairType} onValueChange={(value) => updateConfig('facialHairType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.facialHairType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="facialHairColor">Facial Hair Color</Label>
              <Select value={config.facialHairColor} onValueChange={(value) => updateConfig('facialHairColor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.facialHairColor.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clotheType">Clothing</Label>
              <Select value={config.clotheType} onValueChange={(value) => updateConfig('clotheType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.clotheType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clotheColor">Clothing Color</Label>
              <Select value={config.clotheColor} onValueChange={(value) => updateConfig('clotheColor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.clotheColor.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eyeType">Eyes</Label>
              <Select value={config.eyeType} onValueChange={(value) => updateConfig('eyeType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.eyeType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eyebrowType">Eyebrows</Label>
              <Select value={config.eyebrowType} onValueChange={(value) => updateConfig('eyebrowType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.eyebrowType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mouthType">Mouth</Label>
              <Select value={config.mouthType} onValueChange={(value) => updateConfig('mouthType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.mouthType.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="skinColor">Skin Color</Label>
              <Select value={config.skinColor} onValueChange={(value) => updateConfig('skinColor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.skinColor.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.clotheType === 'GraphicShirt' && (
              <div>
                <Label htmlFor="graphicType">Graphic Design</Label>
                <Select value={config.graphicType} onValueChange={(value) => updateConfig('graphicType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.graphicType.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/([A-Z])/g, ' $1').trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
