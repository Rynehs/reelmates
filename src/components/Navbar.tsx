
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Film, Home, LogOut, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const Navbar = () => {
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const navigate = useNavigate();
  
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
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center">
          <NavLink to="/dashboard" className="text-xl font-bold mr-8 flex items-center">
            <Film className="mr-2" />
            ReelMates
          </NavLink>
          
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
        
        <div className="flex items-center space-x-4">
          <UserAvatar 
            user={{ 
              name: profile?.username || "User", 
              imageUrl: profile?.avatar_url || null 
            }} 
          />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
