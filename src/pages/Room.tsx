
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoomChat from "@/components/RoomChat";
import { RoomMembersList } from "@/components/RoomMembersList";
import RoomMoviesList from "@/components/RoomMoviesList";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";
import RoomJoinRequests from "@/components/RoomJoinRequests";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Settings, PlusCircle, UserPlus, Upload } from "lucide-react";
import AddMovieDialog from "@/components/AddMovieDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const isMobile = useIsMobile();

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
      
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomError) throw roomError;
      if (!roomData) throw new Error('Room not found');
      
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
        
        if (!memberData) {
          toast({
            title: "Access denied",
            description: "You are not a member of this room",
            variant: "destructive",
          });
          navigate('/rooms');
          throw new Error('Not a member of this room');
        }
        
        setIsAdmin(memberData.role === 'admin');
        
        if (memberData.role === 'admin') {
          const { data: joinRequests, error: joinRequestsError } = await supabase
            .from('room_join_requests')
            .select('id')
            .eq('room_id', roomId)
            .eq('status', 'pending');
            
          if (!joinRequestsError) {
            setPendingRequests(joinRequests?.length || 0);
          }
        }
      }

      const { data: settingsData } = await supabase
        .from('room_settings')
        .select('*')
        .eq('room_id', roomId)
        .single();
      
      return {
        ...roomData,
        description: roomData.description || roomData.name,
        settings: settingsData || { allow_member_movie_add: true }
      };
    },
    enabled: !!roomId && !!userId,
  });

  const handleProfileUpdate = async (url: string) => {
    if (!roomId) return;
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ profile_icon: url })
        .eq('id', roomId);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Room profile image has been updated"
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Error updating room profile",
        variant: "destructive"
      });
    }
  };

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

  const canAddMovies = isAdmin || (roomData.settings && roomData.settings.allow_member_movie_add);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4 md:py-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="mb-2">
              <Link to="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Rooms
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div 
                  className="relative cursor-pointer" 
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    {roomData?.profile_icon ? (
                      <AvatarImage src={roomData.profile_icon} alt={roomData.name} />
                    ) : (
                      <AvatarFallback>
                        {roomData?.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                    <Upload className="h-3 w-3" />
                  </div>
                </div>
              )}
              
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{roomData.name}</h1>
                <p className="text-muted-foreground text-sm md:text-base">{roomData.description}</p>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <p className="text-xs bg-muted px-2 py-1 rounded-md">
                      Room Code: <span className="font-mono font-bold">{roomData.code}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isAdmin && pendingRequests > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowJoinRequests(true)}
                className="mt-2 md:mt-0"
                size={isMobile ? "sm" : "default"}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Join Requests
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                  {pendingRequests}
                </span>
              </Button>
            )}
            
            {canAddMovies && (
              <Button 
                onClick={() => setShowAddMovie(true)}
                className="mt-2 md:mt-0"
                size={isMobile ? "sm" : "default"}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            )}
            
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)}
                className="mt-2 md:mt-0"
                size={isMobile ? "sm" : "default"}
              >
                <Settings className="mr-2 h-4 w-4" />
                Room Settings
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
          <Card className="md:col-span-3 flex flex-col">
            <CardHeader className="p-4 border-b space-y-0">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col">
              {activeTab === "chat" && roomId && (
                <div className="flex-1 flex m-0 border-none">
                  <RoomChat roomId={roomId} />
                </div>
              )}
              
              {activeTab === "content" && roomId && (
                <div className="flex-1 m-0 border-none p-4">
                  <RoomMoviesList 
                    roomId={roomId} 
                    isAdmin={isAdmin} 
                    onRefresh={refreshData} 
                    canAddMovies={canAddMovies}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {roomId && (
              <RoomMembersList roomId={roomId} isAdmin={isAdmin} onRefresh={refreshData} />
            )}
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

      {roomId && (
        <AddMovieDialog
          roomId={roomId}
          isOpen={showAddMovie}
          onClose={() => setShowAddMovie(false)}
          onMovieAdded={() => {
            refreshData();
            setShowAddMovie(false);
          }}
        />
      )}

      {roomId && isAdmin && (
        <RoomJoinRequests
          roomId={roomId}
          isOpen={showJoinRequests}
          onClose={() => setShowJoinRequests(false)}
          onRequestHandled={refreshData}
        />
      )}

      {roomId && isAdmin && (
        <FileUploadDialog
          roomId={roomId}
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          currentProfileIcon={roomData?.profile_icon}
          roomName={roomData?.name || ''}
          onImageUploaded={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Room;
