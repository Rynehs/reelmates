
/// <reference types="vite/client" />

// Remove avataaars package dependency by declaring our own module
declare module 'avataaars' {
  import React from 'react';
  
  interface AvatarProps {
    style?: React.CSSProperties;
    avatarStyle?: string;
    topType?: string;
    accessoriesType?: string;
    hairColor?: string;
    facialHairType?: string;
    facialHairColor?: string;
    clotheType?: string;
    clotheColor?: string;
    graphicType?: string;
    eyeType?: string;
    eyebrowType?: string;
    mouthType?: string;
    skinColor?: string;
    hatColor?: string;
  }
  
  const Avatar: React.FC<AvatarProps>;
  export default Avatar;
}
