
import React from 'react';
import { AvataarConfig } from './AvataarCustomizer';

// Simple SVG-based avatar renderer compatible with React 18
export const AvataarRenderer: React.FC<AvataarConfig & { style?: React.CSSProperties }> = ({
  avatarStyle,
  topType,
  accessoriesType,
  hairColor,
  facialHairType,
  facialHairColor,
  clotheType,
  clotheColor,
  eyeType,
  eyebrowType,
  mouthType,
  skinColor,
  style
}) => {
  // Map skin colors to actual color values
  const skinColorMap: Record<string, string> = {
    'Tanned': '#FD9841',
    'Yellow': '#F8D25C',
    'Pale': '#FFDBB4',
    'Light': '#EDB98A',
    'Brown': '#D08B5B',
    'DarkBrown': '#AE5D29',
    'Black': '#614335'
  };

  const skinFill = skinColorMap[skinColor] || '#EDB98A';
  
  // Map hair/cloth colors to actual color values
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

  const hairFill = colorToHex(hairColor);
  const clothFill = colorToHex(clotheColor);
  const facialHairFill = facialHairColor ? colorToHex(facialHairColor) : hairFill;

  // Create a basic avatar with customizable features
  const borderRadius = avatarStyle === 'Circle' ? '50%' : '0';

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        borderRadius,
        overflow: 'hidden',
        backgroundColor: avatarStyle === 'Circle' ? '#E6E6E6' : 'transparent',
        position: 'relative',
        ...style
      }}
    >
      <svg
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background Circle for face */}
        <circle cx="140" cy="120" r="60" fill={skinFill} />

        {/* Simple hair based on topType - render BEHIND face features */}
        {topType.includes('LongHair') && (
          <path 
            d="M80,120 C80,80 100,60 140,60 C180,60 200,80 200,120 V170 H80 V120 Z" 
            fill={hairFill}
            stroke="none"
          />
        )}
        {topType.includes('ShortHair') && (
          <path 
            d="M90,90 C100,60 120,50 140,50 C160,50 180,60 190,90 C200,120 190,130 190,130 H90 C90,130 80,120 90,90 Z" 
            fill={hairFill}
            stroke="none"
          />
        )}

        {/* Eyes based on eyeType */}
        {eyeType === 'Close' ? (
          <>
            <line x1="115" y1="110" x2="125" y2="110" stroke="black" strokeWidth="2" />
            <line x1="155" y1="110" x2="165" y2="110" stroke="black" strokeWidth="2" />
          </>
        ) : eyeType === 'Happy' ? (
          <>
            <path d="M115,105 Q120,95 125,105" stroke="black" fill="transparent" strokeWidth="2" />
            <path d="M155,105 Q160,95 165,105" stroke="black" fill="transparent" strokeWidth="2" />
          </>
        ) : (
          <>
            {/* Default eyes with white background to cover any hair behind them */}
            <circle cx="120" cy="110" r="6" fill="white" />
            <circle cx="120" cy="110" r="3" fill="black" />
            <circle cx="160" cy="110" r="6" fill="white" />
            <circle cx="160" cy="110" r="3" fill="black" />
          </>
        )}

        {/* Eyebrows based on eyebrowType - render ON TOP of eyes */}
        {eyebrowType === 'Angry' ? (
          <>
            <path d="M110,95 L130,100" stroke="black" strokeWidth="2" />
            <path d="M150,100 L170,95" stroke="black" strokeWidth="2" />
          </>
        ) : eyebrowType === 'Default' ? (
          <>
            <path d="M110,95 L130,95" stroke="black" strokeWidth="2" />
            <path d="M150,95 L170,95" stroke="black" strokeWidth="2" />
          </>
        ) : (
          <>
            <path d="M110,95 L130,90" stroke="black" strokeWidth="2" />
            <path d="M150,90 L170,95" stroke="black" strokeWidth="2" />
          </>
        )}

        {/* Mouth based on mouthType */}
        {mouthType === 'Smile' ? (
          <path d="M120,140 Q140,155 160,140" stroke="black" fill="transparent" strokeWidth="2" />
        ) : mouthType === 'Serious' ? (
          <line x1="120" y1="140" x2="160" y2="140" stroke="black" strokeWidth="2" />
        ) : mouthType === 'Sad' ? (
          <path d="M120,145 Q140,130 160,145" stroke="black" fill="transparent" strokeWidth="2" />
        ) : (
          <path d="M120,140 Q140,150 160,140" stroke="black" fill="transparent" strokeWidth="2" />
        )}

        {/* Facial Hair based on facialHairType - render ON TOP of face */}
        {facialHairType === 'BeardMedium' && (
          <path
            d="M100,130 C120,180 160,180 180,130 V150 C160,190 120,190 100,150 V130 Z"
            fill={facialHairFill}
            stroke="none"
          />
        )}
        {facialHairType === 'MoustacheFancy' && (
          <path
            d="M120,130 C130,125 150,125 160,130 C150,135 130,135 120,130 Z"
            fill={facialHairFill}
            stroke="none"
          />
        )}

        {/* Winter Hat on top if selected */}
        {topType === 'WinterHat1' && (
          <g>
            <rect x="90" y="50" width="100" height="50" rx="5" fill={hairFill} />
            <ellipse cx="140" cy="50" rx="50" ry="20" fill={hairFill} />
            <circle cx="140" cy="35" r="10" fill="#FFFFFF" />
          </g>
        )}

        {/* Accessories based on accessoriesType - render LAST to ensure they're on top */}
        {accessoriesType === 'Round' && (
          <>
            <circle cx="120" cy="110" r="15" stroke="black" strokeWidth="2" fill="transparent" />
            <circle cx="160" cy="110" r="15" stroke="black" strokeWidth="2" fill="transparent" />
            <line x1="120" y1="95" x2="160" y2="95" stroke="black" strokeWidth="2" />
          </>
        )}
        {accessoriesType === 'Sunglasses' && (
          <>
            <rect x="105" y="100" width="30" height="20" rx="5" fill="#333" />
            <rect x="145" y="100" width="30" height="20" rx="5" fill="#333" />
            <line x1="135" y1="105" x2="145" y2="105" stroke="#333" strokeWidth="2" />
          </>
        )}
        {accessoriesType === 'Prescription02' && (
          <>
            <circle cx="120" cy="110" r="14" stroke="#333" strokeWidth="2" fill="transparent" />
            <circle cx="160" cy="110" r="14" stroke="#333" strokeWidth="2" fill="transparent" />
            <line x1="134" y1="110" x2="146" y2="110" stroke="#333" strokeWidth="2" />
          </>
        )}

        {/* Clothes based on clotheType */}
        <rect 
          x="80" 
          y="180" 
          width="120" 
          height="100" 
          fill={clothFill} 
        />
        
        {clotheType === 'BlazerShirt' && (
          <>
            <path 
              d="M120,180 V240 H160 V180" 
              fill="#FFFFFF" 
            />
            <path
              d="M110,180 V250 M170,180 V250"
              stroke="#333"
              strokeWidth="2"
            />
          </>
        )}
        {clotheType === 'Hoodie' && (
          <path
            d="M100,180 C120,200 160,200 180,180"
            stroke="#333"
            strokeWidth="5"
            fill="none"
          />
        )}
        {clotheType === 'ShirtScoopNeck' && (
          <path
            d="M115,180 C130,200 150,200 165,180"
            fill="#FFFFFF"
          />
        )}

        {/* Add graphic if clotheType is GraphicShirt */}
        {clotheType === 'GraphicShirt' && (
          <text
            x="140"
            y="210"
            textAnchor="middle"
            fill="#FFFFFF"
            fontWeight="bold"
            fontSize="20"
          >
            {/* Simple text instead of specific graphics */}
            ★
          </text>
        )}
      </svg>
    </div>
  );
};

export default AvataarRenderer;
