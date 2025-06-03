
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationsProvider } from "@/hooks/use-notifications";
import Index from "./pages/Index";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Search = lazy(() => import("./pages/Search"));
const Rooms = lazy(() => import("./pages/Rooms"));
const Room = lazy(() => import("./pages/Room"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TVShowDetails = lazy(() => import("./pages/TVShowDetails"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationsProvider>
          <Toaster />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<Search />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/room/:id" element={<Room />} />
                <Route path="/room-details/:id" element={<RoomDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/tv/:id" element={<TVShowDetails />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
