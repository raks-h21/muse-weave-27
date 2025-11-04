import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
}

export const ShareDialog = ({ open, onOpenChange, galleryId }: ShareDialogProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      generateShareUrl();
    }
  }, [open, galleryId]);

  const generateShareUrl = async () => {
    setLoading(true);
    try {
      // Generate a unique slug for sharing
      const slug = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { error } = await supabase
        .from("galleries")
        .update({ 
          share_slug: slug,
          is_public: true 
        })
        .eq("id", galleryId);

      if (error) throw error;

      const url = `${window.location.origin}/shared/${slug}`;
      setShareUrl(url);
    } catch (error: any) {
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient-gold">Share Your Gallery</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="gallery"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Anyone with this link or QR code can view your gallery
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
