
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { 
  Film, 
  Home, 
  LogOut, 
  Users, 
  Settings, 
  Moon,
  Sun,
  Bell,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationsPanel from "@/components/NotificationsPanel";

export const Navbar = () => {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (!error && data) {
          setProfile(data);
        }
      }
    };
    
    fetchProfile();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (event === 'SIGNED_IN' && session) {
          fetchProfile();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    toast({
      title: `Theme changed to ${newTheme}`,
      description: `App is now in ${newTheme} mode`,
    });
  };
  
  const toggleNotifications = () => {
    toast({
      title: "Notifications settings",
      description: "Notifications preferences will be available soon",
    });
  };

  const updateAvatar = () => {
    navigate('/profile');
    toast({
      title: "Profile settings",
      description: "Update your profile picture in the settings",
    });
  };
  
  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center">
          <NavLink to="/dashboard" className="text-xl font-bold mr-8 flex items-center">
            <Film className="mr-2" />
            ReelMates
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-accent" : "hover:bg-accent/50"
                }`
              }
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </NavLink>
            
            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-md flex items-center ${
                  isActive ? "bg-accent" : "hover:bg-accent/50"
                }`
              }
            >
              <Users className="mr-2 h-4 w-4" />
              Rooms
            </NavLink>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md ${isActive ? "bg-accent" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/rooms" 
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md ${isActive ? "bg-accent" : ""}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Rooms
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Add NotificationsPanel here */}
          <NotificationsPanel />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserAvatar 
                  user={{ 
                    name: profile?.username || "User", 
                    avatar_url: profile?.avatar_url || null 
                  }} 
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <UserAvatar 
                  user={{ 
                    name: profile?.username || "User", 
                    avatar_url: profile?.avatar_url || null 
                  }}
                  size="sm" 
                />
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.username || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">Settings</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleNotifications}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={updateAvatar}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
