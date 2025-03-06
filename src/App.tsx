
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider";
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Rooms from './pages/Rooms';
import Search from './pages/Search';
import Profile from './pages/Profile';
import UserProfilePage from './pages/UserProfile';
import { Toaster } from "@/components/ui/toaster";
import { NotificationsProvider } from "@/hooks/use-notifications";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <NotificationsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/room/:roomId" element={<Room />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:userId" element={<UserProfilePage />} />
            </Routes>
            <Toaster />
          </NotificationsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
