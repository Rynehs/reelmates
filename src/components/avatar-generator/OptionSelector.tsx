
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Option {
  value: string;
  label: string;
  imageUrl?: string;
}

interface OptionSelectorProps {
  options: Option[];
  current: string;
  onChange: (value: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  current,
  onChange
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={current === option.value ? "default" : "outline"}
          className={cn(
            "h-auto min-h-12 px-3 py-2 flex flex-col items-center justify-center transition-all",
            current === option.value 
              ? "bg-hsl-255-70-75 text-white hover:bg-hsl-255-70-65" 
              : "hover:bg-hsl-255-70-75/10"
          )}
          onClick={() => onChange(option.value)}
        >
          <span className="text-xs whitespace-normal text-center">{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default OptionSelector;
