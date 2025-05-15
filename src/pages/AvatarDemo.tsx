
import React, { useState } from 'react';
import { Navbar } from "@/components/Navbar";
import AvatarGenerator, { AvatarConfig } from '@/components/AvatarGenerator';
import { toast } from '@/hooks/use-toast';
import Avatar from 'avataaars';

const AvatarDemo = () => {
  const [savedConfig, setSavedConfig] = useState<AvatarConfig | null>(null);

  const handleSaveAvatar = (config: AvatarConfig) => {
    setSavedConfig(config);
    toast({
      title: "Avatar saved!",
      description: "Your custom avatar has been created successfully."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Avatar Generator</h1>
            <p className="text-muted-foreground mt-2">
              Customize your own unique avatar with our easy-to-use generator
            </p>
          </div>

          {/* If there's a saved config, show it alongside the generator */}
          {savedConfig && (
            <div className="flex flex-col items-center mb-8 p-6 border rounded-lg bg-muted/20">
              <h2 className="text-xl font-semibold mb-4">Your Saved Avatar</h2>
              <div className="h-32 w-32 rounded-full bg-background border overflow-hidden">
                <Avatar
                  style={{ width: '100%', height: '100%' }}
                  {...savedConfig}
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>This avatar has been saved to your profile!</p>
                <p className="mt-1">You can create a new one below.</p>
              </div>
            </div>
          )}

          {/* The Avatar Generator */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <AvatarGenerator onSave={handleSaveAvatar} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvatarDemo;
