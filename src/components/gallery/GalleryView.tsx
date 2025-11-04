import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Share2, Upload } from "lucide-react";
import { ShareDialog } from "./ShareDialog";
import { UploadDialog } from "./UploadDialog";
import { toast } from "sonner";

interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  audio_url: string | null;
  position: number;
}

interface GalleryViewProps {
  galleryId: string;
  isOwner: boolean;
}

export const GalleryView = ({ galleryId, isOwner }: GalleryViewProps) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, [galleryId]);

  useEffect(() => {
    // Clean up audio when component unmounts or artwork changes
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, [audioElement, currentIndex]);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("gallery_id", galleryId)
        .order("position");

      if (error) throw error;
      setArtworks(data || []);
    } catch (error: any) {
      toast.error("Failed to load artworks");
    } finally {
      setLoading(false);
    }
  };

  const currentArtwork = artworks[currentIndex];

  const nextArtwork = () => {
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAudioPlaying(false);
    }
  };

  const prevArtwork = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAudioPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!currentArtwork?.audio_url) return;

    if (audioPlaying) {
      audioElement?.pause();
      setAudioPlaying(false);
    } else {
      if (!audioElement || audioElement.src !== currentArtwork.audio_url) {
        const audio = new Audio(currentArtwork.audio_url);
        audio.onended = () => setAudioPlaying(false);
        setAudioElement(audio);
        audio.play();
      } else {
        audioElement.play();
      }
      setAudioPlaying(true);
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

  if (artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Empty Gallery</h2>
          <p className="text-muted-foreground mb-6">
            {isOwner
              ? "Start building your collection by uploading your first artwork."
              : "This gallery doesn't have any artworks yet."}
          </p>
          {isOwner && (
            <Button variant="spotlight" onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2" size={18} />
              Upload Artwork
            </Button>
          )}
          {isOwner && <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} galleryId={galleryId} onUploadComplete={fetchArtworks} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gallery-wall relative">
      {/* Gallery Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-gradient-to-b from-background to-transparent">
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="gallery" size="sm" onClick={() => setUploadOpen(true)}>
              <Upload size={16} className="mr-2" />
              Upload
            </Button>
            <Button variant="gallery" size="sm" onClick={() => setShareOpen(true)}>
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Main Artwork Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative max-w-6xl w-full">
          {/* Spotlight effect */}
          <div className="absolute inset-0 spotlight-glow pointer-events-none" />
          
          {/* Artwork Frame */}
          <div className="gallery-frame rounded-lg overflow-hidden bg-card">
            <img
              src={currentArtwork.image_url}
              alt={currentArtwork.title}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>

          {/* Artwork Info */}
          <div className="mt-8 text-center space-y-2">
            <h2 className="text-3xl font-bold text-gradient-gold">{currentArtwork.title}</h2>
            {currentArtwork.description && (
              <p className="text-muted-foreground max-w-2xl mx-auto">{currentArtwork.description}</p>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {artworks.length}
              </span>
              {currentArtwork.audio_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className="text-primary hover:text-primary/80"
                >
                  {audioPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span className="ml-2">Audio Guide</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
        <Button
          variant="gallery"
          size="lg"
          onClick={prevArtwork}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ArrowLeft size={20} />
        </Button>
        <Button
          variant="gallery"
          size="lg"
          onClick={nextArtwork}
          disabled={currentIndex === artworks.length - 1}
          className="rounded-full"
        >
          <ArrowRight size={20} />
        </Button>
      </div>

      {isOwner && (
        <>
          <ShareDialog open={shareOpen} onOpenChange={setShareOpen} galleryId={galleryId} />
          <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} galleryId={galleryId} onUploadComplete={fetchArtworks} />
        </>
      )}
    </div>
  );
};
