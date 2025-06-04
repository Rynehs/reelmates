
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Return a loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse-soft">Loading...</div>
    </div>
  );
};

export default Home;
