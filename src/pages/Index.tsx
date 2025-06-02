
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session in Index...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          console.log('Session found in Index, redirecting to dashboard');
          setIsAuthenticated(true);
          navigate("/dashboard");
          return;
        }
        
        console.log('No session in Index');
        setIsLoading(false);
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state change in Index:', event, !!session);
            setIsAuthenticated(!!session);
            
            if (session) {
              navigate("/dashboard");
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in Index checkSession:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
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
          
          <AuthForm />
        </motion.div>
      </div>
      
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>© 2023 ReelMates. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
