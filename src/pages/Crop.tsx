import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { CropCanvas } from "@/components/CropCanvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canvasToBlob, downloadBlob, sharpenImage, adjustBrightness, adjustContrast } from "@/utils/imageUtils";
import { Scissors, Sparkles, Image as ImageIcon, Undo2, Upload } from "lucide-react";
import { toast } from "sonner";

interface CropSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  brightness: number;
  contrast: number;
  sharpening: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

const Crop = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [showCropTool, setShowCropTool] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropSettings, setCropSettings] = useState<CropSettings | null>(null);

  const handleImageLoad = useCallback((file: File, imageUrl: string) => {
    setOriginalFile(file);
    setOriginalImage(imageUrl);
    setOriginalSize(file.size);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);
    setShowCropTool(true);
    setCropSettings(null);
  }, []);

  const handleCrop = useCallback(async (croppedCanvas: HTMLCanvasElement, settings: CropSettings) => {
    setLoading(true);
    setCropSettings(settings);
    
    try {
      let finalCanvas = croppedCanvas;

      // Apply enhancements
      if (settings.brightness !== 0) {
        finalCanvas = adjustBrightness(finalCanvas, settings.brightness);
      }

      if (settings.contrast !== 0) {
        finalCanvas = adjustContrast(finalCanvas, settings.contrast);
      }

      if (settings.sharpening > 0) {
        finalCanvas = sharpenImage(finalCanvas, settings.sharpening);
      }

      // Convert to blob with specified format and quality
      const mimeType = settings.format === 'jpeg' ? 'image/jpeg' :
                       settings.format === 'webp' ? 'image/webp' : 'image/png';
      
      const blob = await canvasToBlob(finalCanvas, mimeType, settings.quality);
      
      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      setShowCropTool(false);
      
      const enhancements = [];
      if (settings.brightness !== 0) enhancements.push(`brightness ${settings.brightness > 0 ? '+' : ''}${settings.brightness}`);
      if (settings.contrast !== 0) enhancements.push(`contrast ${settings.contrast > 0 ? '+' : ''}${settings.contrast}`);
      if (settings.sharpening > 0) enhancements.push(`sharpening ${settings.sharpening}%`);
      if (settings.flipH || settings.flipV) enhancements.push('flipped');
      if (settings.rotation !== 0) enhancements.push(`rotated ${settings.rotation}°`);
      
      const enhancementText = enhancements.length > 0 ? ` with ${enhancements.join(', ')}` : '';
      toast.success(`Image cropped and enhanced successfully${enhancementText}!`);
    } catch (error) {
      console.error('Crop processing error:', error);
      toast.error("Failed to process cropped image");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile || !cropSettings) return;
    
    const baseName = originalFile.name.split('.')[0];
    const extension = cropSettings.format === 'jpeg' ? 'jpg' : cropSettings.format;
    downloadBlob(processedBlob, `${baseName}_cropped.${extension}`);
  }, [processedBlob, originalFile, cropSettings]);

  const handleClear = useCallback(() => {
    setOriginalFile(null);
    setOriginalImage("");
    setProcessedImage("");
    setOriginalSize(0);
    setProcessedSize(0);
    setProcessedBlob(null);
    setShowCropTool(false);
    setCropSettings(null);
  }, []);

  const handleEditAgain = useCallback(() => {
    setShowCropTool(true);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12 px-4 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium mb-4">
              <Scissors className="w-4 h-4" />
              Advanced Image Cropper
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Precision Cropping
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Professional image cropping with aspect ratio control, rotation, flipping, and real-time clarity enhancements
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Upload Section */}
            {!originalFile && (
              <Card className="overflow-hidden bg-gradient-card border-0 shadow-soft animate-slide-up">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Upload Your Image</CardTitle>
                      <CardDescription>
                        Choose an image to crop with professional precision tools
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
                </CardContent>
              </Card>
            )}

            {/* Crop Tool */}
            {showCropTool && originalImage && (
              <Card className="overflow-hidden bg-gradient-card border-0 shadow-soft animate-slide-up">
                <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Scissors className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Crop & Enhance Your Image</CardTitle>
                        <CardDescription>
                          Original: {formatFileSize(originalSize)} • Use the tabs below to crop and enhance
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Pro Editor
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CropCanvas 
                    imageUrl={originalImage} 
                    onCrop={handleCrop} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Processing State */}
            {loading && (
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center">
                      <p className="font-medium">Processing your image...</p>
                      <p className="text-sm text-muted-foreground">Applying crop and enhancements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Preview */}
            {!showCropTool && originalFile && !loading && (
              <div className="space-y-6 animate-slide-up">
                {/* Enhancement Summary */}
                {cropSettings && (
                  <Card className="bg-gradient-to-r from-success/5 to-accent/5 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-sm font-medium">Processing Complete!</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Format: {cropSettings.format.toUpperCase()}</span>
                            {cropSettings.quality < 1 && <span>Quality: {Math.round(cropSettings.quality * 100)}%</span>}
                            {cropSettings.brightness !== 0 && <span>Brightness: {cropSettings.brightness > 0 ? '+' : ''}{cropSettings.brightness}</span>}
                            {cropSettings.contrast !== 0 && <span>Contrast: {cropSettings.contrast > 0 ? '+' : ''}{cropSettings.contrast}</span>}
                            {cropSettings.sharpening > 0 && <span>Sharpening: {Math.round(cropSettings.sharpening * 100)}%</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono">
                            {formatFileSize(processedSize)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Final size
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ImagePreview
                  originalImage={originalImage}
                  processedImage={processedImage}
                  originalSize={originalSize}
                  processedSize={processedSize}
                  onDownload={handleDownload}
                  loading={loading}
                />
              </div>
            )}

            {/* Action Buttons */}
            {processedImage && !loading && (
              <div className="flex justify-center gap-4 animate-slide-up">
                <Button
                  variant="outline"
                  onClick={handleEditAgain}
                  className="gap-2"
                >
                  <Undo2 className="w-4 h-4" />
                  Edit Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  New Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Crop;