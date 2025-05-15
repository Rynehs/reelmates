
import React, { useState, useEffect } from 'react';
import Avatar from 'avataaars';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import OptionSelector from './avatar-generator/OptionSelector';
import ColorSelector from './avatar-generator/ColorSelector';
import {
  hairStyles,
  hairColors,
  facialHairTypes,
  facialHairColors,
  eyeTypes,
  eyebrowTypes,
  mouthTypes,
  skinColors,
  clothesTypes,
  clothesColors,
  accessoriesTypes,
} from './avatar-generator/avatarOptions';

export interface AvatarConfig {
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
  graphicType?: string;
}

interface AvatarGeneratorProps {
  initialConfig?: AvatarConfig;
  onConfigChange?: (config: AvatarConfig) => void;
  onSave?: (config: AvatarConfig) => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ initialConfig, onConfigChange, onSave }) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(initialConfig || {
    avatarStyle: 'Circle',
    topType: 'LongHairMiaWallace',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    facialHairColor: 'Black',
    clotheType: 'BlazerShirt',
    clotheColor: 'Blue03',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Light',
  });

  // Update a specific property in the avatar configuration
  const updateAvatarConfig = (key: keyof AvatarConfig, value: string) => {
    const updatedConfig = { ...avatarConfig, [key]: value };
    setAvatarConfig(updatedConfig);
    if (onConfigChange) {
      onConfigChange(updatedConfig);
    }
  };

  // Generate random avatar configuration
  const generateRandomAvatar = () => {
    const getRandomItem = <T extends string>(items: T[]): T => {
      return items[Math.floor(Math.random() * items.length)];
    };

    const newConfig = {
      avatarStyle: 'Circle' as const,
      topType: getRandomItem(hairStyles.map(h => h.value)),
      accessoriesType: getRandomItem([...accessoriesTypes.map(a => a.value), 'Blank']),
      hairColor: getRandomItem(hairColors.map(c => c.value)),
      facialHairType: getRandomItem([...facialHairTypes.map(f => f.value), 'Blank']),
      facialHairColor: getRandomItem(facialHairColors.map(c => c.value)),
      clotheType: getRandomItem(clothesTypes.map(c => c.value)),
      clotheColor: getRandomItem(clothesColors.map(c => c.value)),
      eyeType: getRandomItem(eyeTypes.map(e => e.value)),
      eyebrowType: getRandomItem(eyebrowTypes.map(e => e.value)),
      mouthType: getRandomItem(mouthTypes.map(m => m.value)),
      skinColor: getRandomItem(skinColors.map(s => s.value)),
    };
    
    setAvatarConfig(newConfig);
    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  // Handle save button click
  const handleSave = () => {
    if (onSave) {
      onSave(avatarConfig);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 p-6">
      {/* Main Avatar Card */}
      <Card className="bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Avatar Preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10">
              <div className="w-64 h-64 md:w-80 md:h-80">
                <Avatar
                  style={{ width: '100%', height: '100%' }}
                  {...avatarConfig}
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={generateRandomAvatar}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Randomize
                </Button>
                {onSave && (
                  <Button 
                    onClick={handleSave}
                    className="bg-hsl-255-70-75 hover:bg-hsl-255-70-65 text-white"
                  >
                    Save Avatar
                  </Button>
                )}
              </div>
            </div>

            {/* Customization Options */}
            <div className="flex-1 min-w-0">
              <Tabs defaultValue="head" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="head">Head</TabsTrigger>
                  <TabsTrigger value="face">Face</TabsTrigger>
                  <TabsTrigger value="clothes">Clothes</TabsTrigger>
                </TabsList>

                {/* HEAD TAB */}
                <TabsContent value="head" className="p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Hair Style</h3>
                      <OptionSelector
                        options={hairStyles}
                        current={avatarConfig.topType}
                        onChange={(value) => updateAvatarConfig('topType', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Hair Color</h3>
                      <ColorSelector
                        colors={hairColors}
                        current={avatarConfig.hairColor}
                        onChange={(value) => updateAvatarConfig('hairColor', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Skin Tone</h3>
                      <ColorSelector
                        colors={skinColors}
                        current={avatarConfig.skinColor}
                        onChange={(value) => updateAvatarConfig('skinColor', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Accessories</h3>
                      <OptionSelector
                        options={accessoriesTypes}
                        current={avatarConfig.accessoriesType}
                        onChange={(value) => updateAvatarConfig('accessoriesType', value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* FACE TAB */}
                <TabsContent value="face" className="p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Eyes</h3>
                      <OptionSelector
                        options={eyeTypes}
                        current={avatarConfig.eyeType}
                        onChange={(value) => updateAvatarConfig('eyeType', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Eyebrows</h3>
                      <OptionSelector
                        options={eyebrowTypes}
                        current={avatarConfig.eyebrowType}
                        onChange={(value) => updateAvatarConfig('eyebrowType', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Mouth</h3>
                      <OptionSelector
                        options={mouthTypes}
                        current={avatarConfig.mouthType}
                        onChange={(value) => updateAvatarConfig('mouthType', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Facial Hair</h3>
                      <OptionSelector
                        options={facialHairTypes}
                        current={avatarConfig.facialHairType}
                        onChange={(value) => updateAvatarConfig('facialHairType', value)}
                      />
                    </div>
                    
                    {avatarConfig.facialHairType !== 'Blank' && (
                      <div>
                        <h3 className="text-lg font-medium mb-3">Facial Hair Color</h3>
                        <ColorSelector
                          colors={facialHairColors}
                          current={avatarConfig.facialHairColor}
                          onChange={(value) => updateAvatarConfig('facialHairColor', value)}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* CLOTHES TAB */}
                <TabsContent value="clothes" className="p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Clothes Type</h3>
                      <OptionSelector
                        options={clothesTypes}
                        current={avatarConfig.clotheType}
                        onChange={(value) => updateAvatarConfig('clotheType', value)}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Clothes Color</h3>
                      <ColorSelector
                        colors={clothesColors}
                        current={avatarConfig.clotheColor}
                        onChange={(value) => updateAvatarConfig('clotheColor', value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarGenerator;
