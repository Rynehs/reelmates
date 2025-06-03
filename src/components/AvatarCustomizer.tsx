
import React, { useState, useCallback } from 'react';
import Avatar from 'avataaars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Shuffle } from 'lucide-react';
import { 
  TopType, 
  AccessoriesType, 
  HairColor, 
  FacialHairType, 
  FacialHairColor, 
  ClotheType, 
  ClotheColor, 
  EyeType, 
  EyebrowType, 
  MouthType, 
  SkinColor 
} from 'avataaars';

interface AvatarOptions {
  topType: TopType;
  accessoriesType: AccessoriesType;
  hairColor: HairColor;
  facialHairType: FacialHairType;
  facialHairColor: FacialHairColor;
  clotheType: ClotheType;
  clotheColor: ClotheColor;
  eyeType: EyeType;
  eyebrowType: EyebrowType;
  mouthType: MouthType;
  skinColor: SkinColor;
}

const topTypes: TopType[] = ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4', 'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart'];

const accessoriesTypes: AccessoriesType[] = ['Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers'];

const hairColors: HairColor[] = ['Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'];

const facialHairTypes: FacialHairType[] = ['Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy', 'MoustacheMagnum'];

const facialHairColors: FacialHairColor[] = ['Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'Platinum', 'Red'];

const clotheTypes: ClotheType[] = ['BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck'];

const clotheColors: ClotheColor[] = ['Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'];

const eyeTypes: EyeType[] = ['Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky'];

const eyebrowTypes: EyebrowType[] = ['Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural'];

const mouthTypes: MouthType[] = ['Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit'];

const skinColors: SkinColor[] = ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'];

const AvatarCustomizer: React.FC = () => {
  const [avatarOptions, setAvatarOptions] = useState<AvatarOptions>({
    topType: 'ShortHairShortCurly',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    facialHairColor: 'BrownDark',
    clotheType: 'BlazerShirt',
    clotheColor: 'PastelBlue',
    eyeType: 'Happy',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    skinColor: 'Light',
  });

  const randomizeAvatar = useCallback(() => {
    const getRandomItem = <T,>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)];
    };

    setAvatarOptions({
      topType: getRandomItem(topTypes),
      accessoriesType: getRandomItem(accessoriesTypes),
      hairColor: getRandomItem(hairColors),
      facialHairType: getRandomItem(facialHairTypes),
      facialHairColor: getRandomItem(facialHairColors),
      clotheType: getRandomItem(clotheTypes),
      clotheColor: getRandomItem(clotheColors),
      eyeType: getRandomItem(eyeTypes),
      eyebrowType: getRandomItem(eyebrowTypes),
      mouthType: getRandomItem(mouthTypes),
      skinColor: getRandomItem(skinColors),
    });
  }, []);

  const downloadAvatar = useCallback(() => {
    const svgElement = document.querySelector('#avatar-preview svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 264;
      canvas.height = 280;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'avatar.png';
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  }, []);

  const updateOption = <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => {
    setAvatarOptions(prev => ({ ...prev, [key]: value }));
  };

  const renderOptionGrid = <K extends keyof AvatarOptions>(
    title: string,
    options: readonly AvatarOptions[K][],
    currentValue: AvatarOptions[K],
    key: K
  ) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {options.map((option) => (
            <Button
              key={String(option)}
              variant={currentValue === option ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => updateOption(key, option)}
            >
              {String(option).replace(/([A-Z])/g, ' $1').trim()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Avatar Customizer</h1>
        <p className="text-muted-foreground">Create your perfect avatar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-center">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div id="avatar-preview" className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                <Avatar
                  style={{ width: '200px', height: '200px' }}
                  avatarStyle="Circle"
                  {...avatarOptions}
                />
              </div>
              <div className="flex gap-2 w-full">
                <Button onClick={randomizeAvatar} variant="outline" className="flex-1">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
                <Button onClick={downloadAvatar} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Options */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {renderOptionGrid('Hair Style', topTypes, avatarOptions.topType, 'topType')}
            {renderOptionGrid('Hair Color', hairColors, avatarOptions.hairColor, 'hairColor')}
            {renderOptionGrid('Facial Hair', facialHairTypes, avatarOptions.facialHairType, 'facialHairType')}
            {renderOptionGrid('Facial Hair Color', facialHairColors, avatarOptions.facialHairColor, 'facialHairColor')}
            {renderOptionGrid('Eyes', eyeTypes, avatarOptions.eyeType, 'eyeType')}
            {renderOptionGrid('Eyebrows', eyebrowTypes, avatarOptions.eyebrowType, 'eyebrowType')}
            {renderOptionGrid('Mouth', mouthTypes, avatarOptions.mouthType, 'mouthType')}
            {renderOptionGrid('Accessories', accessoriesTypes, avatarOptions.accessoriesType, 'accessoriesType')}
            {renderOptionGrid('Clothing', clotheTypes, avatarOptions.clotheType, 'clotheType')}
            {renderOptionGrid('Clothing Color', clotheColors, avatarOptions.clotheColor, 'clotheColor')}
            {renderOptionGrid('Skin Color', skinColors, avatarOptions.skinColor, 'skinColor')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
