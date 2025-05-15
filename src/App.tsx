
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Movie from "./pages/MovieDetails";
import TVShow from "./pages/TVShowDetails";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import RoomDetails from "./pages/RoomDetails";
import Onboarding from "./pages/Onboarding";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import AvatarDemo from "./pages/AvatarDemo";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<Movie />} />
          <Route path="/tv/:id" element={<TVShow />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/room/:id/details" element={<RoomDetails />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/avatars" element={<AvatarDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
