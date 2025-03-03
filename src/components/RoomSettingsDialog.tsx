
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { RoomSettings } from "@/lib/types";

interface RoomSettingsDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings: RoomSettings = {
  room_id: "",
  allow_member_movie_add: true,
  require_movie_approval: false,
  theme: "default",
  private: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const RoomSettingsDialog = ({ roomId, isOpen, onClose }: RoomSettingsDialogProps) => {
  const [settings, setSettings] = useState<RoomSettings>({...defaultSettings, room_id: roomId});
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isOpen || !roomId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("room_settings")
          .select("*")
          .eq("room_id", roomId)
          .single();

        if (error) {
          // If no settings exist, create default settings
          if (error.code === 'PGRST116') {
            const { data: newSettings, error: insertError } = await supabase
              .from("room_settings")
              .insert({ room_id: roomId })
              .select()
              .single();
              
            if (insertError) {
              throw insertError;
            }
            
            if (newSettings) {
              setSettings(newSettings as RoomSettings);
            }
          } else {
            throw error;
          }
        } else {
          setSettings(data as RoomSettings);
        }
      } catch (error) {
        console.error("Error fetching room settings:", error);
        toast({
          title: "Error",
          description: "Failed to load room settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [roomId, isOpen, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("room_settings")
        .upsert({
          room_id: roomId,
          allow_member_movie_add: settings.allow_member_movie_add,
          require_movie_approval: settings.require_movie_approval,
          theme: settings.theme,
          private: settings.private,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Room settings have been updated",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription>
            Customize how your room works and looks.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-member-movie-add">Allow Members to Add Movies</Label>
                <p className="text-sm text-muted-foreground">
                  Members can add movies and TV shows to the room
                </p>
              </div>
              <Switch
                id="allow-member-movie-add"
                checked={settings.allow_member_movie_add}
                onCheckedChange={(checked) => 
                  setSettings({...settings, allow_member_movie_add: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-approval">Require Admin Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Movies added by members require admin approval
                </p>
              </div>
              <Switch
                id="require-approval"
                checked={settings.require_movie_approval}
                onCheckedChange={(checked) => 
                  setSettings({...settings, require_movie_approval: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private-room">Private Room</Label>
                <p className="text-sm text-muted-foreground">
                  Room is only visible to members
                </p>
              </div>
              <Switch
                id="private-room"
                checked={settings.private}
                onCheckedChange={(checked) => 
                  setSettings({...settings, private: checked})
                }
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || loading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomSettingsDialog;
