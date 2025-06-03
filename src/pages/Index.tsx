
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
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
          navigate("/dashboard", { replace: true });
          return;
        }
        
        console.log('No session in Index, showing auth form');
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error in Index checkAuthAndRedirect:', error);
        setIsLoading(false);
      }
    };
    
    checkAuthAndRedirect();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change in Index:', event, !!session);
        
        if (session && event === 'SIGNED_IN') {
          console.log('User signed in, redirecting to dashboard');
          navigate("/dashboard", { replace: true });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
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
