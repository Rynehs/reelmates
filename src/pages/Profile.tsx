import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Upload, Bell, User, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Profile = () => {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupPhase, setSetupPhase] = useState<"initial" | "qrcode" | "verification">("initial");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
          setUsername(data.username || "");
          setAvatarUrl(data.avatar_url);
        } else {
          toast({
            title: "Error fetching profile",
            description: error?.message || "Please try again later",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } else {
        navigate("/");
      }
      setIsLoading(false);
    };
    
    fetchProfile();
  }, [navigate, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setIsLoading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    const publicUrl = publicUrlData.publicUrl;
    setAvatarUrl(publicUrl);
    
    // Update the profile
    if (profile?.id) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);
        
      if (updateError) {
        toast({
          title: "Update failed",
          description: updateError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully",
        });
      }
    }
    
    setIsLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        username,
        updated_at: new Date().toISOString() 
      })
      .eq("id", profile.id);
      
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setProfile(prev => prev ? { ...prev, username } : null);
    }
    
    setIsLoading(false);
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification preferences have been updated",
    });
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      setPasswordError(error.message);
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    
    setIsLoading(false);
  };

  const generateTOTPSecret = () => {
    // This function generates a random base32 string to use as a TOTP secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 20; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const initiateTwoFactorSetup = async () => {
    setVerificationError(null);
    setIsLoading(true);
    
    try {
      // Generate a new TOTP secret
      const totpSecret = generateTOTPSecret();
      setSecret(totpSecret);
      
      // The user's email will be used as the account name
      const accountName = profile?.username || 'user';
      const issuer = 'ReelMates'; // App name
      
      // Generate a URL for the QR code
      const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      
      // Generate a URL for the QR code image
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
      
      setQrCodeUrl(qrCodeImageUrl);
      setSetupPhase("qrcode");
      setIsLoading(false);
    } catch (error) {
      console.error("2FA setup error:", error);
      toast({
        title: "Setup failed",
        description: "Failed to initiate two-factor authentication setup",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const verifyTwoFactorSetup = async () => {
    setVerificationError(null);
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, you would verify the code against the secret
      // Here we're simulating a successful verification for demo purposes
      
      // Generate backup codes
      const generatedBackupCodes = Array.from({ length: 10 }, () => 
        Math.floor(100000 + Math.random() * 900000).toString()
      );
      
      setBackupCodes(generatedBackupCodes);
      setTwoFactorEnabled(true);
      
      // In a real implementation, you would save the secret and backup codes to the database
      // associated with the user's account
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            two_factor_enabled: true,
            // In a real app, you would encrypt these values
            // Note: You would need to add these columns to your profiles table
            // two_factor_secret: secret, 
            // backup_codes: generatedBackupCodes.join(',')
          })
          .eq("id", profile.id);
          
        if (error) {
          console.error("Error saving 2FA settings:", error);
          toast({
            title: "Error",
            description: "Failed to save two-factor authentication settings",
            variant: "destructive",
          });
        }
      }
      
      setShowBackupCodes(true);
      setIsLoading(false);
    } catch (error) {
      console.error("2FA verification error:", error);
      setVerificationError("Invalid verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const finishTwoFactorSetup = () => {
    setShowBackupCodes(false);
    setSetupPhase("initial");
    toast({
      title: "Two-factor authentication enabled",
      description: "Your account is now more secure with 2FA",
    });
  };

  const disableTwoFactor = async () => {
    setIsLoading(true);
    
    try {
      if (profile?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ 
            two_factor_enabled: false,
            // In a real app, you would also clear the secret and backup codes
            // two_factor_secret: null,
            // backup_codes: null
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
        description: "2FA has been turned off for your account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Your username"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdateProfile} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Update your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24">
                    <UserAvatar 
                      user={{ 
                        name: username || "User", 
                        avatar_url: avatarUrl 
                      }} 
                      size="lg"
                      className="w-24 h-24"
                    />
                  </div>
                  
                  <div className="w-full">
                    <Label htmlFor="avatar" className="hidden">Upload Avatar</Label>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled={isLoading}
                        onClick={() => document.getElementById('avatar')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Picture
                      </Button>
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications in-app</p>
                  </div>
                  <Switch 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setupPhase === "initial" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">
                            {twoFactorEnabled 
                              ? "Two-factor authentication is currently enabled" 
                              : "Protect your account with an authenticator app"}
                          </p>
                        </div>
                        <Switch 
                          checked={twoFactorEnabled} 
                          onCheckedChange={(checked) => {
                            if (!checked && twoFactorEnabled) {
                              disableTwoFactor();
                            } else if (checked && !twoFactorEnabled) {
                              initiateTwoFactorSetup();
                            }
                          }}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}
                  
                  {setupPhase === "qrcode" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Scan QR Code</h4>
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code with your authenticator app (such as Google Authenticator or Authy)
                      </p>
                      <div className="flex justify-center">
                        {qrCodeUrl ? (
                          <img 
                            src={qrCodeUrl}
                            alt="QR Code for 2FA setup" 
                            className="w-48 h-48 border border-border rounded-md"
                          />
                        ) : (
                          <div className="w-48 h-48 border border-border rounded-md flex items-center justify-center">
                            <span>Loading QR code...</span>
                          </div>
                        )}
                      </div>
                      
                      {secret && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Manual Entry Code</p>
                          <p className="text-sm break-all font-mono">{secret}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            If you can't scan the QR code, enter this code manually in your app
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => setSetupPhase("verification")}
                        className="w-full"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                  
                  {setupPhase === "verification" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Enter Verification Code</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your authenticator app
                      </p>
                      
                      {verificationError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{verificationError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="verification-code">Verification Code</Label>
                        <Input 
                          id="verification-code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setSetupPhase("qrcode")}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={verifyTwoFactorSetup}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="flex-1"
                        >
                          {isLoading ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recovery Backup Codes</DialogTitle>
            <DialogDescription>
              Store these backup codes securely. Each code can be used once to access your account if you lose your device.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 my-4">
            {backupCodes.map((code, index) => (
              <div key={index} className="p-2 bg-muted rounded-md font-mono text-center">
                {code}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline">Download Codes</Button>
            <Button onClick={finishTwoFactorSetup}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
