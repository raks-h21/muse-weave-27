import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GalleryView } from "@/components/gallery/GalleryView";
import { AIChatbot } from "@/components/chat/AIChatbot";

const SharedGallery = () => {
  const { slug } = useParams<{ slug: string }>();
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, [slug]);

  const loadGallery = async () => {
    if (!slug) {
      setError("Invalid gallery link");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("galleries")
        .select("id, is_public")
        .eq("share_slug", slug)
        .single();

      if (error || !data) {
        setError("Gallery not found");
        return;
      }

      if (!data.is_public) {
        setError("This gallery is private");
        return;
      }

      setGalleryId(data.id);
    } catch (err) {
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !galleryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Gallery Not Available</h2>
          <p className="text-muted-foreground">{error || "Gallery not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <GalleryView galleryId={galleryId} isOwner={false} />
      <AIChatbot />
    </>
  );
};

export default SharedGallery;
