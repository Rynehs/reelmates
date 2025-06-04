
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Film, Search, UserPlus } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingMovies, fetchPopularMovies, discoverMovies } from "@/lib/tmdb";
import { MediaItem } from "@/lib/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Dashboard: Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Dashboard auth error:', error);
          navigate('/', { replace: true });
          return;
        }
        
        if (!session) {
          console.log('Dashboard: No session, redirecting to home');
          navigate('/', { replace: true });
          return;
        }
        
        console.log('Dashboard: User authenticated:', session.user.id);
        setUser(session.user);
        
        // Check if profile exists and onboarding is completed
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
          // If there's an error other than "not found", redirect to onboarding
          navigate("/onboarding", { replace: true });
          return;
        }
        
        if (!profile || profile.onboarding_completed === false) {
          console.log('Dashboard: Onboarding not completed, redirecting...');
          navigate("/onboarding", { replace: true });
          return;
        }
        
        console.log('Dashboard: Authentication complete, loading dashboard');
        setIsLoading(false);
        
      } catch (error) {
        console.error('Dashboard auth check error:', error);
        navigate('/', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Define all queries
  const { data: trendingMovies = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: async () => {
      const response = await fetchTrendingMovies();
      return response.results;
    },
    enabled: !isLoading && !!user
  });

  const { data: popularMovies = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: async () => {
      const response = await fetchPopularMovies();
      return response.results;
    },
    enabled: !isLoading && !!user
  });

  const { data: actionMovies = [], isLoading: isActionLoading } = useQuery({
    queryKey: ['actionMovies'],
    queryFn: async () => {
      const response = await discoverMovies({ with_genres: '28' });
      return response.results;
    },
    enabled: !isLoading && !!user
  });

  const { data: comedyMovies = [], isLoading: isComedyLoading } = useQuery({
    queryKey: ['comedyMovies'],
    queryFn: async () => {
      const response = await discoverMovies({ with_genres: '35' });
      return response.results;
    },
    enabled: !isLoading && !!user
  });

  const goToSearch = () => {
    navigate('/search');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Define placeholder data
  const watchedMovies: MediaItem[] = [];
  const toWatchMovies: MediaItem[] = [];
  const favoriteMovies: MediaItem[] = [];
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Welcome to ReelMates</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Track and Share Movies with Friends</div>
              <p className="text-sm text-muted-foreground mt-1">
                Discover new movies, create watch parties, and discuss your favorite films.
              </p>
              <div className="flex mt-4 space-x-3">
                <Button onClick={goToSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Find Movies
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Activity</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Get Started</div>
              <p className="text-sm text-muted-foreground mt-1">
                Join rooms or create your own to share movies with friends.
              </p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => navigate('/rooms')}>
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <MovieCarousel 
            movies={trendingMovies?.map(movie => ({...movie, media_type: 'movie'}))} 
            title="Trending Today" 
          />
        </section>

        <section className="mb-8">
          <MovieCarousel 
            movies={actionMovies?.map(movie => ({...movie, media_type: 'movie'}))} 
            title="Action Movies" 
          />
        </section>
        
        <section className="mb-8">
          <MovieCarousel 
            movies={comedyMovies?.map(movie => ({...movie, media_type: 'movie'}))} 
            title="Comedy Movies" 
          />
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular Movies</h2>
            <Button variant="outline" size="sm" onClick={goToSearch}>
              View All
            </Button>
          </div>
          {isPopularLoading ? (
            <div className="flex justify-center py-10">
              <p>Loading popular movies...</p>
            </div>
          ) : (
            <MovieList
              watchedMovies={watchedMovies}
              toWatchMovies={popularMovies?.map(movie => ({...movie, media_type: 'movie'}))}
              favoriteMovies={favoriteMovies}
              isLoading={isPopularLoading}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
