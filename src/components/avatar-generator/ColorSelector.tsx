
import React from 'react';
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";

export interface Color {
  value: string;
  label: string;
  hex: string;
}

interface ColorSelectorProps {
  colors: Color[];
  current: string;
  onChange: (value: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  current,
  onChange
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <Toggle
          key={color.value}
          variant="outline"
          pressed={current === color.value}
          onPressedChange={() => onChange(color.value)}
          className={cn(
            "h-8 w-8 rounded-full p-0 border-2 overflow-hidden",
            current === color.value ? "ring-2 ring-hsl-255-70-75 ring-offset-2" : ""
          )}
          aria-label={`Select color ${color.label}`}
        >
          <span 
            className="w-full h-full block"
            style={{ backgroundColor: color.hex }}
          />
        </Toggle>
      ))}
    </div>
  );
};

export default ColorSelector;
