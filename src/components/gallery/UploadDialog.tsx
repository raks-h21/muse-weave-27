import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, Music } from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
  onUploadComplete: () => void;
}

export const UploadDialog = ({ open, onOpenChange, galleryId, onUploadComplete }: UploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const imageDropzone = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => setImageFile(files[0]),
  });

  const audioDropzone = useDropzone({
    accept: { "audio/*": [] },
    maxFiles: 1,
    onDrop: (files) => setAudioFile(files[0]),
  });

  const handleUpload = async () => {
    if (!imageFile || !title) {
      toast.error("Please provide at least a title and image");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image
      const imageExt = imageFile.name.split(".").pop();
      const imagePath = `${user.id}/${Date.now()}.${imageExt}`;
      const { error: imageError } = await supabase.storage
        .from("artworks")
        .upload(imagePath, imageFile);

      if (imageError) throw imageError;

      const { data: { publicUrl: imageUrl } } = supabase.storage
        .from("artworks")
        .getPublicUrl(imagePath);

      // Upload audio if provided
      let audioUrl = null;
      if (audioFile) {
        const audioExt = audioFile.name.split(".").pop();
        const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
        const { error: audioError } = await supabase.storage
          .from("audio")
          .upload(audioPath, audioFile);

        if (audioError) throw audioError;

        const { data: { publicUrl } } = supabase.storage
          .from("audio")
          .getPublicUrl(audioPath);
        audioUrl = publicUrl;
      }

      // Get current max position
      const { data: artworks } = await supabase
        .from("artworks")
        .select("position")
        .eq("gallery_id", galleryId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = artworks && artworks.length > 0 ? artworks[0].position + 1 : 0;

      // Create artwork record
      const { error: insertError } = await supabase
        .from("artworks")
        .insert({
          gallery_id: galleryId,
          user_id: user.id,
          title,
          description,
          image_url: imageUrl,
          audio_url: audioUrl,
          position: nextPosition,
        });

      if (insertError) throw insertError;

      toast.success("Artwork uploaded successfully!");
      onUploadComplete();
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setAudioFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload artwork");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient-gold">Add Artwork</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Masterpiece"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story behind your artwork..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image *</Label>
            <div
              {...imageDropzone.getRootProps()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...imageDropzone.getInputProps()} />
              {imageFile ? (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-sm">{imageFile.name}</p>
                  <p className="text-xs text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm">Drop your image here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audio Guide (Optional)</Label>
            <div
              {...audioDropzone.getRootProps()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <input {...audioDropzone.getInputProps()} />
              {audioFile ? (
                <div className="space-y-2">
                  <Music className="w-10 h-10 mx-auto text-primary" />
                  <p className="text-sm">{audioFile.name}</p>
                  <p className="text-xs text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Music className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm">Add an audio narration</p>
                  <p className="text-xs text-muted-foreground">MP3, WAV up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="spotlight"
            className="w-full"
            onClick={handleUpload}
            disabled={uploading || !imageFile || !title}
          >
            {uploading ? "Uploading..." : "Add to Gallery"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
