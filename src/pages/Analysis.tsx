import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KolamResults } from '@/components/KolamResults';
import { GeneratedKolams } from '@/components/GeneratedKolams';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from "../context/AnalysisContext";

const API_URL = import.meta.env.VITE_API_URL;

export const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { result } = useAnalysis();

  const [analysisText, setAnalysisText] = useState<string>("");
  const [equationsText, setEquationsText] = useState<string>("");

  useEffect(() => {
    if (result) {
      // Extract filename from URL
      const analysisFilename = result.analysis_txt_url?.split('/').pop();
      const equationsFilename = result.equations_txt_url?.split('/').pop();

      // Fetch analysis.txt using the new /files endpoint
      if (analysisFilename) {
        fetch(`${API_URL}/files/${analysisFilename}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.text();
          })
          .then(text => setAnalysisText(text))
          .catch(err => {
            console.error('Error fetching analysis text:', err);
            setAnalysisText(`Failed to load analysis text: ${err.message}`);
          });
      } else {
        setAnalysisText("No analysis file available.");
      }

      // Fetch equations.txt using the new /files endpoint
      if (equationsFilename) {
        fetch(`${API_URL}/files/${equationsFilename}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.text();
          })
          .then(text => setEquationsText(text))
          .catch(err => {
            console.error('Error fetching equations text:', err);
            setEquationsText(`Failed to load equations: ${err.message}`);
          });
      } else {
        setEquationsText("No equations file available.");
      }
    }
  }, [result]);

  if (!result) return <div>No analysis found. Please upload a file first.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="sacred-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kolam Analysis Results</h1>
            <p className="text-muted-foreground">
              Discover the cultural significance and mathematical beauty
            </p>
          </div>
        </div>


        <div className="space-y-12">
          <KolamResults
            analysisData={{
              analysisImageUrl: result.analysis_image_url ? `${API_URL}/files/${result.analysis_image_url.split('/').pop()}` : undefined,
              mathematicalAnalysis: analysisText,
              equations: equationsText,
              desmosUrl: result.desmos_url ? `${API_URL}/files/${result.desmos_url.split('/').pop()}` : undefined,
              analysisTxtUrl: result.analysis_txt_url ? `${API_URL}/download/${result.analysis_txt_url.split('/').pop()}` : undefined,
              equationsTxtUrl: result.equations_txt_url ? `${API_URL}/download/${result.equations_txt_url.split('/').pop()}` : undefined,
              imageDownloadUrl: result.analysis_image_url ? `${API_URL}/download/${result.analysis_image_url.split('/').pop()}` : undefined,
            }}
          />
          <GeneratedKolams />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
