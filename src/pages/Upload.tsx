import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload as UploadIcon, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetType, setDatasetType] = useState<'set_a' | 'set_b'>('set_a');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a .txt file containing the transcript.",
          variant: "destructive",
        });
      }
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a transcript file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const transcriptContent = await readFileContent(selectedFile);

      // Insert the sales call record
      const { data: insertedCall, error: insertError } = await supabase
        .from('sales_calls')
        .insert({
          filename: selectedFile.name,
          dataset_type: datasetType,
          transcript_content: transcriptContent,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`);
      }

      toast({
        title: "File uploaded successfully",
        description: `${selectedFile.name} has been uploaded to ${datasetType.toUpperCase()}.`,
      });

      setIsUploading(false);
      setIsAnalyzing(true);

      // Trigger AI analysis
      const { data: analysisResponse, error: analysisError } = await supabase.functions.invoke(
        'analyze-sales-call',
        {
          body: {
            callId: insertedCall.id,
            transcript: transcriptContent,
            datasetType: datasetType,
          },
        }
      );

      if (analysisError) {
        throw new Error(`Analysis error: ${analysisError.message}`);
      }

      toast({
        title: "Analysis completed",
        description: "Your sales call has been analyzed successfully!",
      });

      // Reset form
      setSelectedFile(null);
      setDatasetType('set_a');
      
      // Navigate to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Upload/Analysis error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Upload Sales Call Transcript</h1>
          <p className="text-lg text-muted-foreground">
            Upload your sales call transcript for comprehensive AI analysis
          </p>
        </div>

        {/* Upload Card */}
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript Upload
            </CardTitle>
            <CardDescription>
              Select a .txt file containing your sales call transcript
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dataset Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Dataset</Label>
              <RadioGroup 
                value={datasetType} 
                onValueChange={(value) => setDatasetType(value as 'set_a' | 'set_b')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="set_a" id="set_a" />
                  <Label htmlFor="set_a" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Set A</div>
                      <div className="text-sm text-muted-foreground">Training dataset group A</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="set_b" id="set_b" />
                  <Label htmlFor="set_b" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Set B</div>
                      <div className="text-sm text-muted-foreground">Training dataset group B</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* File Selection */}
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="text-base font-medium">
                Transcript File
              </Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">({Math.round(selectedFile.size / 1024)}KB)</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              className="w-full"
              size="lg"
              disabled={!selectedFile || isUploading || isAnalyzing}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">What happens after upload?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <span>Your transcript is securely stored and categorized into the selected dataset</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <span>AI performs comprehensive analysis including sentiment, engagement, and conversion likelihood</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <span>Results are instantly available in your dashboard with actionable insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <span>Comparative analysis updates automatically as you add more transcripts</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;