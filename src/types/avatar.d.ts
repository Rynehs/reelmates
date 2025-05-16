
// Avatar type definitions
declare interface UserAvatarProps {
  name?: string;
  avatar_url?: string | null;
}

// AvataaarsJS Configuration Types
declare interface AvatarConfig {
  avatarStyle: 'Circle' | 'Transparent';
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

// Individual option types
declare type TopType = 
  'NoHair' | 'Eyepatch' | 'Hat' | 'Hijab' | 'Turban' | 
  'WinterHat1' | 'WinterHat2' | 'WinterHat3' | 'WinterHat4' | 
  'LongHairBigHair' | 'LongHairBob' | 'LongHairBun' | 'LongHairCurly' | 
  'LongHairCurvy' | 'LongHairDreads' | 'LongHairFrida' | 'LongHairFro' | 
  'LongHairFroBand' | 'LongHairNotTooLong' | 'LongHairShavedSides' | 
  'LongHairMiaWallace' | 'LongHairStraight' | 'LongHairStraight2' | 
  'LongHairStraightStrand' | 'ShortHairDreads01' | 'ShortHairDreads02' | 
  'ShortHairFrizzle' | 'ShortHairShaggyMullet' | 'ShortHairShortCurly' | 
  'ShortHairShortFlat' | 'ShortHairShortRound' | 'ShortHairShortWaved' | 
  'ShortHairSides' | 'ShortHairTheCaesar' | 'ShortHairTheCaesarSidePart';

declare type AccessoriesType = 
  'Blank' | 'Kurt' | 'Prescription01' | 'Prescription02' | 
  'Round' | 'Sunglasses' | 'Wayfarers';

declare type HairColor = 
  'Auburn' | 'Black' | 'Blonde' | 'BlondeGolden' | 
  'Brown' | 'BrownDark' | 'PastelPink' | 'Platinum' | 
  'Red' | 'SilverGray';

declare type FacialHairType = 
  'Blank' | 'BeardMedium' | 'BeardLight' | 'BeardMajestic' | 
  'MoustacheFancy' | 'MoustacheMagnum';

declare type FacialHairColor = 
  'Auburn' | 'Black' | 'Blonde' | 'BlondeGolden' | 
  'Brown' | 'BrownDark' | 'Platinum' | 'Red';

declare type ClotheType = 
  'BlazerShirt' | 'BlazerSweater' | 'CollarSweater' | 
  'GraphicShirt' | 'Hoodie' | 'Overall' | 'ShirtCrewNeck' | 
  'ShirtScoopNeck' | 'ShirtVNeck';

declare type ClotheColor = 
  'Black' | 'Blue01' | 'Blue02' | 'Blue03' | 'Gray01' | 
  'Gray02' | 'Heather' | 'PastelBlue' | 'PastelGreen' | 
  'PastelOrange' | 'PastelRed' | 'PastelYellow' | 'Pink' | 
  'Red' | 'White';

declare type EyeType = 
  'Close' | 'Cry' | 'Default' | 'Dizzy' | 'EyeRoll' | 
  'Happy' | 'Hearts' | 'Side' | 'Squint' | 'Surprised' | 
  'Wink' | 'WinkWacky';

declare type EyebrowType = 
  'Angry' | 'AngryNatural' | 'Default' | 'DefaultNatural' | 
  'FlatNatural' | 'RaisedExcited' | 'RaisedExcitedNatural' | 
  'SadConcerned' | 'SadConcernedNatural' | 'UnibrowNatural' | 
  'UpDown' | 'UpDownNatural';

declare type MouthType = 
  'Concerned' | 'Default' | 'Disbelief' | 'Eating' | 
  'Grimace' | 'Sad' | 'ScreamOpen' | 'Serious' | 
  'Smile' | 'Tongue' | 'Twinkle' | 'Vomit';

declare type SkinColor = 
  'Tanned' | 'Yellow' | 'Pale' | 'Light' | 'Brown' | 
  'DarkBrown' | 'Black';
