import React from 'react';
import { Download, ExternalLink, Sparkles, Calculator, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KolamResultsProps {
  analysisData?: {
    culturalDescription?: string;
    mathematicalAnalysis?: string;
    analysisImageUrl?: string;
    equations?: string;
    desmosUrl?: string;
    analysisTxtUrl?: string;
    equationsTxtUrl?: string;
    imageDownloadUrl?: string;
  };
}

export const KolamResults: React.FC<KolamResultsProps> = ({ analysisData }) => {
  if (!analysisData) return null;

  // const handleViewDesmos = () => {
  //   if (analysisData.desmosUrl) {
  //     window.open(`http://localhost:8000${analysisData.desmosUrl}`, '_blank');
  //   }
  // };

  return (
    <div className="space-y-8">
      {/* Cultural Description Section */}
      <Card className="cultural-border sacred-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Palette className="w-6 h-6 text-primary" />
            Cultural & Spiritual Significance
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-secondary to-accent text-secondary-foreground"
            >
              AI Generated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="kolam-pattern bg-card/50 p-6 rounded-lg">
            <p className="text-foreground leading-relaxed font-devanagari">
              {analysisData.culturalDescription || 
               "Cultural insights will be generated here."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mathematical Analysis Section */}
      <Card className="cultural-border sacred-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Calculator className="w-6 h-6 text-neon" />
            Mathematical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Analysis Text */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Analysis Results</h4>
              <div className="bg-card/50 p-4 rounded-lg math-grid">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {analysisData.mathematicalAnalysis}
                </pre>
              </div>
              {analysisData.analysisTxtUrl && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={analysisData.analysisTxtUrl} target="_blank"
                      rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download analysis.txt
                  </a>
                </Button>
              )}
            </div>

            {/* Analysis Visualization */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Visualization</h4>
                {analysisData.imageDownloadUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <a href={analysisData.imageDownloadUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </a>
                  </Button>
                )}
              </div>
              <div className="bg-card/50 p-4 rounded-lg aspect-square flex items-center justify-center border border-neon/20">
                {analysisData.analysisImageUrl ? (
                  <img 
                    src={analysisData.analysisImageUrl}
                    alt="Kolam Analysis Visualization"
                    className="max-w-full max-h-full rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Sparkles className="w-12 h-12 mx-auto text-neon mandala-spin" />
                    <p className="text-sm text-muted-foreground">
                      Analysis visualization will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parametric Equations Section */}
      <Card className="cultural-border sacred-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <ExternalLink className="w-6 h-6 text-mystic" />
            Parametric Mathematical Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Equations</h4>
              <div className="bg-card/50 p-4 rounded-lg border border-mystic/20 max-h-96 overflow-y-auto equations-scrollbar">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {analysisData.equations}
                </pre>
              </div>
              {analysisData.equationsTxtUrl && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                 <a href={analysisData.equationsTxtUrl} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download equations.txt
                  </a>
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Interactive Visualization</h4>
              <div className="bg-card/50 p-6 rounded-lg text-center space-y-4 border border-mystic/20">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    View the mathematical model interactively
                  </p>
                  {/* <Button 
                    onClick={handleViewDesmos}
                    className="bg-gradient-to-r from-mystic to-mystic-glow hover:shadow-lg transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Visualization
                  </Button> */}
                  <Button asChild>
                    <a href={analysisData.desmosUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Desmos
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
