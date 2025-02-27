
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Users, User } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { User as UserType } from "@/lib/types";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<Partial<UserType>>({});
  
  useEffect(() => {
    // In a real app, we'd get the user from auth context
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bottom-nav py-2">
      <div className="reelmates-container">
        <div className="flex justify-around items-center">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center p-2 ${
              isActive("/dashboard") 
                ? "text-accent" 
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link
            to="/search"
            className={`flex flex-col items-center p-2 ${
              isActive("/search") 
                ? "text-accent" 
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          
          <Link
            to="/rooms"
            className={`flex flex-col items-center p-2 ${
              isActive("/rooms") 
                ? "text-accent" 
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Rooms</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center p-2 ${
              isActive("/profile") 
                ? "text-accent" 
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {user.avatar_url ? (
              <UserAvatar user={user} size="sm" />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
