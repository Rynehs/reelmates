
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Checking session in Login page...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsCheckingAuth(false);
          return;
        }
        
        if (session) {
          console.log('Session found in Login, redirecting to dashboard');
          navigate("/dashboard", { replace: true });
          return;
        }
        
        console.log('No session in Login, showing auth form');
        setIsCheckingAuth(false);
        
      } catch (error) {
        console.error('Error in Login checkAuthAndRedirect:', error);
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [navigate]);

  const clearError = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password || (mode === "register" && !username)) {
      setError("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          toast({
            title: "Logged in successfully",
            description: "Welcome back to ReelMates!",
          });
          
          // Force a page reload to the dashboard
          window.location.href = '/dashboard';
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });
        
        if (error) throw error;
        
        if (data.user) {
          toast({
            title: "Account created successfully",
            description: "Welcome to ReelMates!",
          });
          
          // Force a page reload to the dashboard
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "Authentication failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Google auth error:", error);
      setError(error.message || "Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ReelMates</h1>
            <p className="text-muted-foreground">Track, share, and discuss movies with friends</p>
          </div>
          
          <Tabs 
            value={mode} 
            onValueChange={(value) => {
              clearError();
              setMode(value as "login" | "register");
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="login" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="johndoe" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        autoComplete="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">Email</Label>
                      <Input 
                        id="email-register" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <Input 
                        id="password-register" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      Google
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ReelMates. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
