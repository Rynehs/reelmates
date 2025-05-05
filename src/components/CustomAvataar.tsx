
import React from 'react';
import { AvataarConfig } from './AvataarCustomizer';

// This component will replace the incompatible avataaars package
const CustomAvataar: React.FC<{
  style?: React.CSSProperties;
  avatarStyle?: string;
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
  hatColor?: string;
}> = (props) => {
  // Create a URL for the DiceBear avataaars API, which is compatible with our config
  const generateDicebearUrl = () => {
    const params = new URLSearchParams();
    
    // Map our config properties to DiceBear parameters
    if (props.topType) params.append('top', props.topType.toLowerCase());
    if (props.accessoriesType && props.accessoriesType !== 'Blank') 
      params.append('accessories', props.accessoriesType.toLowerCase());
    if (props.hairColor) params.append('hairColor', props.hairColor.toLowerCase());
    if (props.facialHairType && props.facialHairType !== 'Blank') 
      params.append('beard', props.facialHairType.toLowerCase());
    if (props.facialHairColor) params.append('beardColor', props.facialHairColor.toLowerCase());
    if (props.clotheType) params.append('clothes', props.clotheType.toLowerCase());
    if (props.clotheColor) params.append('clothesColor', props.clotheColor.toLowerCase());
    if (props.graphicType && props.graphicType !== 'Blank') 
      params.append('clothesGraphic', props.graphicType.toLowerCase());
    if (props.eyeType) params.append('eyes', props.eyeType.toLowerCase());
    if (props.eyebrowType) params.append('eyebrows', props.eyebrowType.toLowerCase());
    if (props.mouthType) params.append('mouth', props.mouthType.toLowerCase());
    if (props.skinColor) params.append('skin', props.skinColor.toLowerCase());
    if (props.hatColor) params.append('hatColor', props.hatColor.toLowerCase());

    // Set a high quality render
    params.append('h', '240');
    params.append('w', '240');

    // Use DiceBear avataaars implementation
    return `https://avatars.dicebear.com/api/avataaars/${encodeURIComponent(JSON.stringify(props))}.svg?${params.toString()}`;
  };

  return (
    <div style={props.style || {}}>
      <img 
        src={generateDicebearUrl()} 
        alt="Avatar" 
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
};

export default CustomAvataar;
