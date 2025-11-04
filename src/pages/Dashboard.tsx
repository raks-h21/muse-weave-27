import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Gallery {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Artwork {
  id: string;
  title: string;
  image_url: string;
}

const Dashboard = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [artworkCounts, setArtworkCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadGalleries(session.user.id);
  };

  const loadGalleries = async (userId: string) => {
    try {
      const { data: galleriesData, error } = await supabase
        .from("galleries")
        .select("id, title, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGalleries(galleriesData || []);

      // Load artwork counts for each gallery
      const counts: Record<string, number> = {};
      for (const gallery of galleriesData || []) {
        const { count } = await supabase
          .from("artworks")
          .select("*", { count: "exact", head: true })
          .eq("gallery_id", gallery.id);
        counts[gallery.id] = count || 0;
      }
      setArtworkCounts(counts);
    } catch (error: any) {
      toast.error("Failed to load galleries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient-gold mb-2">Your Galleries</h1>
            <p className="text-muted-foreground">Manage your art collections</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/gallery")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Gallery
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Galleries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Card
              key={gallery.id}
              className="hover:border-primary transition-colors cursor-pointer"
              onClick={() => navigate("/gallery")}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <ImageIcon className="text-primary" size={24} />
                  <span className="text-sm text-muted-foreground">
                    {artworkCounts[gallery.id] || 0} artworks
                  </span>
                </div>
                <CardTitle className="mt-4">{gallery.title}</CardTitle>
                <CardDescription>{gallery.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(gallery.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You don't have any galleries yet.</p>
            <Button variant="spotlight" onClick={() => navigate("/gallery")}>
              Create Your First Gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
