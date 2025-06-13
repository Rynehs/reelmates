import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; 
import { Navbar } from "@/components/Navbar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { generateTOTPSecret, validateTOTP, generateBackupCodes } from "@/lib/otp";
import { Loader2, Copy, CheckCircle, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarPicker } from "@/components/AvatarPicker";
import { AvatarCustomizer } from "@/components/AvatarCustomizer";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    username: string | null;
    avatar_url: string | null;
    two_factor_enabled: boolean | null;
  } | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarTab, setAvatarTab] = useState<"preset" | "custom" | "customize">("preset");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      
      if (data.session?.user) {
        setUser(data.session.user);
      } else {
        navigate("/login");
      }
    };
    
    getUserSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/login");
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const getProfile = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || '');
          setAvatarUrl(profileData.avatar_url || '');
          setTwoFactorEnabled(profileData.two_factor_enabled || false);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      getProfile();
    }
  }, [user, toast]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WEBP)",
        variant: "destructive",
      });
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      
      const publicUrl = publicUrlData.publicUrl;
      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    setIsUpdating(true);
    try {
      setAvatarUrl(avatarUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsernameUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username })
        .eq("id", profile?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Username updated",
        description: "Your username has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const setupTwoFactor = async () => {
    setIsLoading(true);
    
    try {
      const totpSecret = generateTOTPSecret();
      setSecret(totpSecret);
      
      const accountName = profile?.username || 'user';
      const issuer = 'ReelMates';
      
      const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
      
      setQrCodeUrl(qrCodeImageUrl);
      setShowQRCode(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to set up two-factor authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const isValid = validateTOTP(secret, verificationCode);
      
      if (!isValid) {
        toast({
          title: "Invalid code",
          description: "The verification code is invalid. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const generatedBackupCodes = generateBackupCodes(10);
      setBackupCodes(generatedBackupCodes);
      
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            two_factor_enabled: true
          })
          .eq("id", profile.id);
          
        if (error) {
          console.error("Error saving 2FA settings:", error);
          toast({
            title: "Error",
            description: "Failed to save two-factor authentication settings",
            variant: "destructive",
          });
          return;
        }
      }
      
      setTwoFactorEnabled(true);
      setShowBackupCodes(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setIsLoading(true);
    
    try {
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            two_factor_enabled: false
          })
          .eq("id", profile.id);
          
        if (error) {
          console.error("Error disabling 2FA:", error);
          throw error;
        }
      }
      
      setTwoFactorEnabled(false);
      toast({
        title: "Two-factor authentication disabled",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <UserAvatar 
              user={{ 
                name: username || "User", 
                avatar_url: avatarUrl || null 
              }} 
              size="xl"
              showLoadingState={isUpdating}
            />
            
            <Tabs value={avatarTab} onValueChange={(v) => setAvatarTab(v as "preset" | "custom" | "customize")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preset">Preset Avatars</TabsTrigger>
                <TabsTrigger value="customize">Customize Avatar</TabsTrigger>
                <TabsTrigger value="custom">Custom Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="preset" className="mt-4">
                <AvatarPicker
                  selectedAvatar={avatarUrl}
                  onSelect={handleSelectPresetAvatar}
                />
              </TabsContent>
              <TabsContent value="customize" className="mt-4">
                <AvatarCustomizer
                  onSelect={handleSelectPresetAvatar}
                  initialConfig={avatarUrl}
                />
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                <div className="flex space-x-2">
                  <Input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUpdating}
                  />
                  <Label 
                    htmlFor="avatar-upload" 
                    className={`${isUpdating 
                      ? 'bg-secondary/50' 
                      : 'bg-secondary hover:bg-secondary/80'} text-secondary-foreground rounded-md px-4 py-2 cursor-pointer transition-colors flex items-center w-full justify-center`}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Avatar
                      </>
                    )}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Maximum file size: 2MB. Accepted formats: JPEG, PNG, GIF, WEBP
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Username */}
          <div className="grid w-full max-w-sm mx-auto items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isUpdating}
            />
            <Button 
              onClick={handleUsernameUpdate} 
              disabled={isUpdating || !username.trim()}
              className="mt-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Username"
              )}
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
            {twoFactorEnabled ? (
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is enabled for your account.
                  </p>
                  <Button variant="destructive" size="sm" onClick={disableTwoFactor} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Disable"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">
                  Set up two-factor authentication to add an extra layer of security to your account.
                </p>
                <Button size="sm" onClick={setupTwoFactor} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Setup Two-Factor Authentication"
                  )}
                </Button>
              </div>
            )}

            {showQRCode && (
              <div className="rounded-md border p-4">
                <h3 className="text-md font-semibold">Scan this QR code with your authenticator app:</h3>
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto my-4" />
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="my-2"
                />
                <Button onClick={verifyAndEnable2FA} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Verify and Enable"
                  )}
                </Button>
              </div>
            )}

            {showBackupCodes && (
              <div className="rounded-md border p-4">
                <h3 className="text-md font-semibold">Backup Codes:</h3>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <p>
                    Store these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
                  </p>
                </Alert>
                <ul className="list-disc list-inside my-4">
                  {backupCodes.map((code, index) => (
                    <li key={index}>{code}</li>
                  ))}
                </ul>
                <Button variant="outline" onClick={copyBackupCodes} disabled={isCopied}>
                  {isCopied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Codes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
