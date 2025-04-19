
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; 
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import FollowList from "@/components/FollowList";
import { User } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { Loader2, Users } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndSuggestions = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        const currentUser = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.email || '',
          created_at: data.session.user.created_at,
        };
        setUser(currentUser);

        // Fetch suggested users (excluding current user and already followed users)
        const { data: suggestedData, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', currentUser.id)
          .limit(5);

        if (error) {
          console.error('Error fetching suggested users:', error);
        } else {
          setSuggestedUsers(suggestedData.map(profile => ({
            id: profile.id,
            name: profile.username || 'Unknown User',
            email: '', // We don't expose email
            avatar_url: profile.avatar_url,
            created_at: '' // We don't expose creation date
          })));
        }
      }
      
      setLoading(false);
    };

    fetchUserAndSuggestions();
  }, []);

  const handleFollow = async (followingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_followers')
        .insert({ follower_id: user.id, following_id: followingId });

      if (error) throw error;

      // Remove the followed user from suggestions
      setSuggestedUsers(prev => prev.filter(u => u.id !== followingId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Follow List Column */}
          <div className="md:col-span-2">
            <FollowList />
          </div>

          {/* Suggested Users Column */}
          <div>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 mr-2 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Suggested Users</h2>
              </div>
              
              {suggestedUsers.length > 0 ? (
                <div className="space-y-4">
                  {suggestedUsers.map((suggestedUser) => (
                    <div 
                      key={suggestedUser.id} 
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          user={{ 
                            name: suggestedUser.name, 
                            avatar_url: suggestedUser.avatar_url 
                          }} 
                        />
                        <Link 
                          to={`/user/${suggestedUser.id}`} 
                          className="font-medium hover:underline"
                        >
                          {suggestedUser.name}
                        </Link>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleFollow(suggestedUser.id)}
                      >
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No suggested users
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
