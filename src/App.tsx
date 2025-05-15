
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider";
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Rooms from './pages/Rooms';
import Search from './pages/Search';
import Profile from './pages/Profile';
import UserProfilePage from './pages/UserProfile';
import MovieDetails from './pages/MovieDetails';
import TVShowDetails from './pages/TVShowDetails';
import Onboarding from './pages/Onboarding';
import { Toaster } from "@/components/ui/toaster";
import { NotificationsProvider } from "@/hooks/use-notifications";

// Initialize query client with v4 syntax
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <NotificationsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:id" element={<UserProfilePage />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv/:id" element={<TVShowDetails />} />
            </Routes>
            <Toaster />
          </NotificationsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
