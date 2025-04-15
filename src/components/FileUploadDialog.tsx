
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FileUploadDialogProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  currentProfileIcon?: string;
  roomName: string;
  onImageUploaded: (url: string) => void;
}

export function FileUploadDialog({ 
  roomId, 
  isOpen, 
  onClose, 
  currentProfileIcon, 
  roomName,
  onImageUploaded 
}: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create preview URL for selected file
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Free memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, PNG, GIF, or WebP image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
  };

  const clearFileSelection = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}-${Date.now()}.${fileExt}`;
      const filePath = `room-profile-pics/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from('room-profile-pics')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase
        .storage
        .from('room-profile-pics')
        .getPublicUrl(filePath);

      // Return the URL to the parent component
      onImageUploaded(data.publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Room profile picture has been updated"
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Room Profile Picture</DialogTitle>
          <DialogDescription>
            Upload an image to represent your room. Recommended size: 512x512px.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex items-center justify-center">
            {preview ? (
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={preview} alt="Preview" />
                </Avatar>
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={clearFileSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : currentProfileIcon ? (
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentProfileIcon} alt="Current profile" />
                <AvatarFallback>
                  {roomName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarFallback>
                  {roomName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {!file && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label 
                htmlFor="picture" 
                className="flex cursor-pointer justify-center rounded-md border border-input p-4 hover:bg-accent"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>Select Image</span>
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
