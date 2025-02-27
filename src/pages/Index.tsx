
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem("authenticated") === "true";
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    
    if (authenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ReelMates</h1>
            <p className="text-muted-foreground">Track, share, and discuss movies with friends</p>
          </div>
          
          <AuthForm onSuccess={handleAuthSuccess} />
        </motion.div>
      </div>
      
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>© 2023 ReelMates. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
