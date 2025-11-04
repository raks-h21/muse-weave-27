import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8 spotlight-glow">
          <Palette className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="text-gradient-gold">Atelier</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Create stunning digital galleries for your artwork
        </p>
        
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          Upload your art, add descriptions and audio guides, then share your museum-quality gallery with the world
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="spotlight"
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6"
          >
            Enter the Gallery
          </Button>
          
          <Button
            variant="gallery"
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6"
          >
            Learn More
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <h3 className="text-xl font-semibold text-primary mb-2">Museum Experience</h3>
            <p className="text-muted-foreground">Immersive 2D gallery with elegant navigation</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <h3 className="text-xl font-semibold text-primary mb-2">Audio Guides</h3>
            <p className="text-muted-foreground">Add narrations to bring your artwork to life</p>
          </div>
          
          <div className="p-6 rounded-lg bg-card/50 backdrop-blur border border-border">
            <h3 className="text-xl font-semibold text-primary mb-2">Easy Sharing</h3>
            <p className="text-muted-foreground">Share with QR codes or direct links</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
