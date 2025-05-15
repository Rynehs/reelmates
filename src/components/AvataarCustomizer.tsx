
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AvatarGenerator, { AvatarConfig } from "./AvatarGenerator";

interface AvataarCustomizerProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
}

const AvataarCustomizer: React.FC<AvataarCustomizerProps> = ({ initialConfig, onSave, onCancel }) => {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig | undefined>(initialConfig);

  const handleSave = () => {
    if (currentConfig) {
      onSave(currentConfig);
    }
  };

  const handleAvatarChange = (config: AvatarConfig) => {
    setCurrentConfig(config);
  };

  return (
    <div className="flex flex-col space-y-4">
      <AvatarGenerator 
        initialConfig={initialConfig} 
        onConfigChange={handleAvatarChange} 
      />
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!currentConfig}>
          Save Avatar
        </Button>
      </div>
    </div>
  );
};

export type { AvatarConfig };
export default AvataarCustomizer;
