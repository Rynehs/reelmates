
// Avatar type definitions
declare interface UserAvatarProps {
  name?: string;
  avatar_url?: string | null;
}

// AvataaarsJS Configuration Types
declare interface AvatarConfig {
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
