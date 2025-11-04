import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GalleryView } from "@/components/gallery/GalleryView";
import { Button } from "@/components/ui/button";
import { AIChatbot } from "@/components/chat/AIChatbot";
import { LogOut, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

const Gallery = () => {
  const [user, setUser] = useState<any>(null);
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await getOrCreateGallery(session.user.id);
    setLoading(false);
  };

  const getOrCreateGallery = async (userId: string) => {
    // Get user's first gallery or create one
    const { data: galleries, error } = await supabase
      .from("galleries")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Error fetching gallery:", error);
      return;
    }

    if (galleries && galleries.length > 0) {
      setGalleryId(galleries[0].id);
    } else {
      // Create default gallery
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      const { data: newGallery, error: createError } = await supabase
        .from("galleries")
        .insert({
          user_id: userId,
          title: `${profile?.username || "My"}'s Gallery`,
          description: "Welcome to my personal gallery",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating gallery:", createError);
        return;
      }

      setGalleryId(newGallery.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (loading || !galleryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Navigation */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-foreground hover:text-primary"
        >
          <LayoutGrid size={16} className="mr-2" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-foreground hover:text-destructive"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>

      <GalleryView galleryId={galleryId} isOwner={true} />
      <AIChatbot />
    </div>
  );
};

export default Gallery;
