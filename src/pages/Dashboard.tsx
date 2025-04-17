
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { MovieList } from "@/components/MovieList";
import { MovieCarousel } from "@/components/MovieCarousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Film, Search, Plus } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import CreateTestNotificationButton from '@/components/CreateTestNotificationButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const goToSearch = () => {
    navigate('/search');
  };

  // Fetch trending movies
  const { data: trendingMovies = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: async () => {
      const response = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=2dca580c2a14b55200e784d157207b4d`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      const data = await response.json();
      return data.results;
    },
  });

  // Fetch popular movies
  const { data: popularMovies = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: async () => {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=2dca580c2a14b55200e784d157207b4d`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }
      const data = await response.json();
      return data.results;
    },
  });
  
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
                <CreateTestNotificationButton />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Activity</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending Today</h2>
          </div>
          {isTrendingLoading ? (
            <div className="flex justify-center py-10">
              <p>Loading trending movies...</p>
            </div>
          ) : (
            <MovieCarousel movies={trendingMovies} />
          )}
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
            <MovieList movies={popularMovies.slice(0, 6)} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
