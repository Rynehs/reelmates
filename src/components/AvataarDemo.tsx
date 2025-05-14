
import React from 'react';
import Avatar from 'avataaars';
import { Card } from '@/components/ui/card';

const AvataarDemo = () => {
  return (
    <div className="flex flex-col items-center p-6 gap-8">
      <h1 className="text-2xl font-bold">Avataaars Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Example 1 - Basic Avatar */}
        <Card className="p-4 flex flex-col items-center">
          <div className="h-40 w-40">
            <Avatar
              avatarStyle='Circle'
              topType='LongHairMiaWallace'
              accessoriesType='Prescription02'
              hairColor='Red'
              facialHairType='MoustacheMagnum'
              facialHairColor='Black'
              clotheType='Overall'
              clotheColor='Blue01'
              eyeType='EyeRoll'
              eyebrowType='UnibrowNatural'
              mouthType='Serious'
              skinColor='Light'
            />
          </div>
          <h3 className="mt-4 font-medium">Basic Avatar</h3>
        </Card>

        {/* Example 2 - Business Avatar */}
        <Card className="p-4 flex flex-col items-center">
          <div className="h-40 w-40">
            <Avatar
              avatarStyle='Circle'
              topType='ShortHairShortFlat'
              accessoriesType='Round'
              hairColor='Black'
              facialHairType='BeardLight'
              facialHairColor='Black'
              clotheType='BlazerShirt'
              clotheColor='Gray01'
              eyeType='Happy'
              eyebrowType='Default'
              mouthType='Smile'
              skinColor='Light'
            />
          </div>
          <h3 className="mt-4 font-medium">Business Avatar</h3>
        </Card>

        {/* Example 3 - Casual Avatar */}
        <Card className="p-4 flex flex-col items-center">
          <div className="h-40 w-40">
            <Avatar
              avatarStyle='Circle'
              topType='LongHairBob'
              accessoriesType='Blank'
              hairColor='Brown'
              facialHairType='Blank'
              clotheType='GraphicShirt'
              clotheColor='PastelBlue'
              graphicType='Pizza'
              eyeType='Wink'
              eyebrowType='RaisedExcited'
              mouthType='Tongue'
              skinColor='Tanned'
            />
          </div>
          <h3 className="mt-4 font-medium">Casual Avatar</h3>
        </Card>
      </div>

      <div className="mt-8 text-left w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">How to Use Avataaars</h2>
        <div className="bg-muted p-4 rounded-md text-sm font-mono">
          {`import Avatar from 'avataaars';
          
<Avatar
  avatarStyle='Circle'
  topType='LongHairMiaWallace'
  accessoriesType='Prescription02'
  hairColor='Red'
  facialHairType='MoustacheMagnum'
  facialHairColor='Black'
  clotheType='Overall'
  clotheColor='Blue01'
  eyeType='EyeRoll'
  eyebrowType='UnibrowNatural'
  mouthType='Serious'
  skinColor='Light'
/>`}
        </div>
      </div>
    </div>
  );
};

export default AvataarDemo;
