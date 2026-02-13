import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calculator, Palette, ExternalLink, Wand2 } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { KolamUpload } from '../components/KolamUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/kolam-hero.jpg';
import axios from 'axios';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { setResult } = useAnalysis();

  const handleUploadResult = (result: any) => {
    setResult(result);
    setIsAnalyzing(false);
    navigate('/analysis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-neon/20" />

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-neon bg-clip-text text-transparent">
                கோலம் அனலைசர்
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground font-devanagari">
                Kolam Analyzer
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover the sacred geometry, cultural significance, and mathematical beauty hidden within traditional kolam patterns
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full">
                <Palette className="w-4 h-4 text-primary" />
                <span>Cultural Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full">
                <Calculator className="w-4 h-4 text-neon" />
                <span>Mathematical Modeling</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full">
                <ExternalLink className="w-4 h-4 text-mystic" />
                <span>Interactive Visualization</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">
              Begin Your Journey of Discovery
            </h3>
            <p className="text-muted-foreground">
              Upload an image of your kolam to unlock its cultural stories and mathematical secrets
            </p>
          </div>

          <KolamUpload onUpload={handleUploadResult} isAnalyzing={isAnalyzing} />

          {/* Alternative Actions */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/generator')} 
              variant="outline" 
              className="w-full max-w-md"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate New Kolam Patterns
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="cultural-border sacred-glow text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Cultural Heritage</h4>
              <p className="text-muted-foreground">
                AI-powered analysis reveals the spiritual significance, regional variations, and traditional meanings encoded in your kolam
              </p>
            </CardContent>
          </Card>

          <Card className="cultural-border sacred-glow text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-neon to-neon-glow rounded-full flex items-center justify-center">
                <Calculator className="w-8 h-8 text-background" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Mathematical Beauty</h4>
              <p className="text-muted-foreground">
                Discover the geometric patterns, symmetries, and mathematical principles that make your kolam a masterpiece of sacred geometry
              </p>
            </CardContent>
          </Card>

          <Card className="cultural-border sacred-glow text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-mystic to-mystic-glow rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-background mandala-spin" />
              </div>
              <h4 className="text-xl font-semibold text-foreground">Interactive Models</h4>
              <p className="text-muted-foreground">
                Explore parametric equations and interactive mathematical models that capture the essence of your kolam's design
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 bg-card/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Preserving tradition through technology • Celebrating the intersection of art, culture, and mathematics
            </p>
            <div className="flex justify-center items-center gap-2 text-sm">
              <span className="text-primary">•</span>
              <span className="font-devanagari">சத்யம் ஷிவம் சுந்தராம்</span>
              <span className="text-primary">•</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
