
import React, { useState } from 'react';
import { Navbar } from "@/components/Navbar";
import AvatarGenerator, { AvatarConfig } from '@/components/AvatarGenerator';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import Avatar from 'avataaars';
import { Separator } from '@/components/ui/separator';

const AvatarGeneratorPage = () => {
  const [savedAvatars, setSavedAvatars] = useState<AvatarConfig[]>([]);

  const handleSaveAvatar = (config: AvatarConfig) => {
    setSavedAvatars(prev => [config, ...prev].slice(0, 3));
    
    // Store as JSON in localStorage for demo purposes
    try {
      const avatarJson = JSON.stringify(config);
      localStorage.setItem('savedAvatar', avatarJson);
    } catch (error) {
      console.error('Error saving avatar to localStorage:', error);
    }
    
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
              Create your own unique avatar with our customization tools
            </p>
          </div>

          {/* Avatar Generator */}
          <AvatarGenerator onSave={handleSaveAvatar} />
          
          {/* Saved Avatars */}
          {savedAvatars.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">Your Recent Avatars</h2>
              <Separator className="mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {savedAvatars.map((config, index) => (
                  <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="h-40 w-40 mb-4">
                        <Avatar
                          style={{ width: '100%', height: '100%' }}
                          {...config}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avatar {savedAvatars.length - index}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AvatarGeneratorPage;
