
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoomSettings {
  room_id: string;
  allow_member_movie_add: boolean;
  require_movie_approval: boolean;
  theme: string;
  private: boolean;
}

interface RoomSettingsDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RoomSettingsDialog = ({ roomId, isOpen, onClose }: RoomSettingsDialogProps) => {
  const [settings, setSettings] = useState<RoomSettings>({
    room_id: roomId,
    allow_member_movie_add: true,
    require_movie_approval: false,
    theme: "default",
    private: false
  });
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // Fetch room settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("room_settings")
          .select("*")
          .eq("room_id", roomId)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }
        
        // Fetch room name
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("name")
          .eq("id", roomId)
          .single();
        
        if (roomError) {
          throw roomError;
        }
        
        if (settingsData) {
          setSettings(settingsData);
        }
        
        if (roomData) {
          setRoomName(roomData.name);
        }
      } catch (error) {
        console.error("Error fetching room settings:", error);
        toast({
          title: "Error",
          description: "Failed to load room settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen && roomId) {
      fetchSettings();
    }
  }, [roomId, isOpen, toast]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Update room settings
      const { error: settingsError } = await supabase
        .from("room_settings")
        .upsert({
          room_id: roomId,
          allow_member_movie_add: settings.allow_member_movie_add,
          require_movie_approval: settings.require_movie_approval,
          theme: settings.theme,
          private: settings.private,
          updated_at: new Date().toISOString()
        });
      
      if (settingsError) {
        throw settingsError;
      }
      
      // Update room name
      const { error: roomError } = await supabase
        .from("rooms")
        .update({ name: roomName })
        .eq("id", roomId);
      
      if (roomError) {
        throw roomError;
      }
      
      toast({
        title: "Settings saved",
        description: "Room settings have been updated successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving room settings:", error);
      toast({
        title: "Error",
        description: "Failed to save room settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription>
            Customize your room settings and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          
          <div className="space-y-4">
            <Label className="text-sm font-medium">Room Permissions</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-members-add" className="text-sm">
                  Allow Members to Add Media
                </Label>
                <p className="text-xs text-muted-foreground">
                  Members can add movies and TV shows to the room
                </p>
              </div>
              <Switch
                id="allow-members-add"
                checked={settings.allow_member_movie_add}
                onCheckedChange={(checked) => 
                  setSettings((prev) => ({ ...prev, allow_member_movie_add: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-approval" className="text-sm">
                  Require Admin Approval
                </Label>
                <p className="text-xs text-muted-foreground">
                  Added media requires admin approval before being shown
                </p>
              </div>
              <Switch
                id="require-approval"
                checked={settings.require_movie_approval}
                onCheckedChange={(checked) => 
                  setSettings((prev) => ({ ...prev, require_movie_approval: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private-room" className="text-sm">
                  Private Room
                </Label>
                <p className="text-xs text-muted-foreground">
                  Room is only accessible by invitation
                </p>
              </div>
              <Switch
                id="private-room"
                checked={settings.private}
                onCheckedChange={(checked) => 
                  setSettings((prev) => ({ ...prev, private: checked }))
                }
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => setSettings((prev) => ({ ...prev, theme: value }))}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
                <SelectItem value="neon">Neon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomSettingsDialog;
