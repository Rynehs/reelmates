
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoomChat from "@/components/RoomChat";
import RoomMembersList from "@/components/RoomMembersList";
import RoomMoviesList from "@/components/RoomMoviesList";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Settings } from "lucide-react";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate('/login');
        return;
      }
      setUserId(session.user.id);
    };
    
    checkAuth();
  }, [navigate]);

  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['room', roomId, refreshTrigger],
    queryFn: async () => {
      if (!roomId) throw new Error('Room ID is required');
      
      // Fetch the room data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*, description:name')
        .eq('id', roomId)
        .single();
      
      if (roomError) throw roomError;
      if (!roomData) throw new Error('Room not found');
      
      // Check if user is a member of this room
      if (userId) {
        const { data: memberData, error: memberError } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .single();
        
        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error checking room membership:', memberError);
        }
        
        // If user isn't a member, redirect to rooms page
        if (!memberData) {
          toast({
            title: "Access denied",
            description: "You are not a member of this room",
            variant: "destructive",
          });
          navigate('/rooms');
          throw new Error('Not a member of this room');
        }
        
        // Check if user is admin based on role
        setIsAdmin(memberData.role === 'admin');
      }
      
      return {
        ...roomData,
        description: roomData.name // Using name as description for now
      };
    },
    enabled: !!roomId && !!userId,
  });

  if (isLoading) {
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

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="mt-4 text-xl font-semibold">Error Loading Room</h2>
            <p className="mt-2 text-muted-foreground">
              {error instanceof Error ? error.message : "Unable to load the room"}
            </p>
            <Button asChild className="mt-4">
              <Link to="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Button asChild variant="outline" size="sm" className="mb-2">
              <Link to="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Rooms
              </Link>
            </Button>
            
            <h1 className="text-2xl font-bold md:text-3xl">{roomData.name}</h1>
            <p className="text-muted-foreground">{roomData.description}</p>
          </div>
          
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(true)}
              className="mt-2 md:mt-0"
            >
              <Settings className="mr-2 h-4 w-4" />
              Room Settings
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
          <Card className="md:col-span-3 flex flex-col">
            <CardHeader className="p-4 border-b space-y-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col">
              <TabsContent value="chat" className="flex-1 flex m-0 border-none">
                {roomId && <RoomChat roomId={roomId} />}
              </TabsContent>
              
              <TabsContent value="content" className="flex-1 m-0 border-none">
                {roomId && <RoomMoviesList roomId={roomId} isAdmin={isAdmin} onRefresh={refreshData} />}
              </TabsContent>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {roomId && <RoomMembersList roomId={roomId} isAdmin={isAdmin} onRefresh={refreshData} />}
          </div>
        </div>
      </div>
      
      {roomId && isAdmin && (
        <RoomSettingsDialog 
          roomId={roomId} 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default Room;
