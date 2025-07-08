import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { loadImageFromFile, canvasToBlob, downloadBlob, enhanceClarity } from "@/utils/imageUtils";
import { Sparkles, Zap, Settings2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const Resize = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  // Dimension settings
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState<string>("");
  const [newHeight, setNewHeight] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [resizeMode, setResizeMode] = useState<"dimensions" | "percentage">("dimensions");
  const [percentageScale, setPercentageScale] = useState<string>("100");

  // Advanced settings
  const [algorithm, setAlgorithm] = useState<'smooth' | 'high-quality' | 'pixelated'>('high-quality');
  const [sharpenStrength, setSharpenStrength] = useState([0]);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [outputQuality, setOutputQuality] = useState([90]);

  const handleImageLoad = useCallback(async (file: File, imageUrl: string) => {
    setOriginalFile(file);
    setOriginalImage(imageUrl);
    setOriginalSize(file.size);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);

    // Get original dimensions
    const img = await loadImageFromFile(file);
    setOriginalDimensions({ width: img.width, height: img.height });
    setNewWidth(img.width.toString());
    setNewHeight(img.height.toString());
  }, []);

  const updateDimensions = useCallback((width: string, height: string, isWidthChange: boolean) => {
    if (!maintainAspectRatio) {
      setNewWidth(width);
      setNewHeight(height);
      return;
    }

    const aspectRatio = originalDimensions.width / originalDimensions.height;
    
    if (isWidthChange) {
      const w = parseInt(width) || 0;
      const h = Math.round(w / aspectRatio);
      setNewWidth(width);
      setNewHeight(h.toString());
    } else {
      const h = parseInt(height) || 0;
      const w = Math.round(h * aspectRatio);
      setNewWidth(w.toString());
      setNewHeight(height);
    }
  }, [maintainAspectRatio, originalDimensions]);

  const resizeImageHandler = useCallback(async () => {
    if (!originalFile) return;

    setLoading(true);
    try {
      const img = await loadImageFromFile(originalFile);
      
      let targetWidth: number;
      let targetHeight: number;

      if (resizeMode === "percentage") {
        const scale = parseFloat(percentageScale) / 100;
        targetWidth = Math.round(img.width * scale);
        targetHeight = Math.round(img.height * scale);
      } else {
        targetWidth = parseInt(newWidth) || img.width;
        targetHeight = parseInt(newHeight) || img.height;
      }

      const canvas = enhanceClarity(img, targetWidth, targetHeight, {
        algorithm,
        sharpen: sharpenStrength[0],
        maintainAspectRatio
      });

      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 
                       outputFormat === 'webp' ? 'image/webp' : 'image/png';
      const quality = outputFormat === 'png' ? 1 : outputQuality[0] / 100;
      
      const blob = await canvasToBlob(canvas, mimeType, quality);

      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      
      toast.success(`Image resized to ${targetWidth}×${targetHeight}px with ${algorithm} quality`);
    } catch (error) {
      console.error('Resize error:', error);
      toast.error("Failed to resize image");
    } finally {
      setLoading(false);
    }
  }, [originalFile, resizeMode, newWidth, newHeight, percentageScale, maintainAspectRatio, algorithm, sharpenStrength, outputFormat, outputQuality]);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile) return;
    
    const baseName = originalFile.name.split('.')[0];
    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    downloadBlob(processedBlob, `${baseName}_resized.${extension}`);
  }, [processedBlob, originalFile, outputFormat]);

  const handleClear = useCallback(() => {
    setOriginalFile(null);
    setOriginalImage("");
    setProcessedImage("");
    setOriginalSize(0);
    setProcessedSize(0);
    setProcessedBlob(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setNewWidth("");
    setNewHeight("");
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12 px-4 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Advanced Image Resizer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Smart Image Resizing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Resize images with AI-powered clarity enhancement, advanced algorithms, and pixel-perfect precision
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload Section */}
            <Card className="overflow-hidden bg-gradient-card border-0 shadow-soft animate-slide-up">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Upload Your Image</CardTitle>
                    <CardDescription>
                      Support for JPG, PNG, WebP, and GIF • Processing happens locally in your browser
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
              </CardContent>
            </Card>

            {originalFile && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Settings Panel */}
                <Card className="bg-gradient-card border-0 shadow-soft animate-slide-up">
                  <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Settings2 className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Resize Settings</CardTitle>
                        <CardDescription>
                          Original: {originalDimensions.width}×{originalDimensions.height}px
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Resize Mode Tabs */}
                    <Tabs value={resizeMode} onValueChange={(value) => setResizeMode(value as "dimensions" | "percentage")}>
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                        <TabsTrigger value="dimensions" className="text-sm">Custom Size</TabsTrigger>
                        <TabsTrigger value="percentage" className="text-sm">Scale %</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="dimensions" className="space-y-4 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="width" className="text-sm font-medium">Width (px)</Label>
                            <Input
                              id="width"
                              type="number"
                              value={newWidth}
                              onChange={(e) => updateDimensions(e.target.value, newHeight, true)}
                              className="text-center"
                              placeholder="Width"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height" className="text-sm font-medium">Height (px)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={newHeight}
                              onChange={(e) => updateDimensions(newWidth, e.target.value, false)}
                              className="text-center"
                              placeholder="Height"
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="percentage" className="space-y-4 mt-6">
                        <div className="space-y-3">
                          <Label htmlFor="percentage" className="text-sm font-medium">Scale Percentage</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="percentage"
                              type="number"
                              value={percentageScale}
                              onChange={(e) => setPercentageScale(e.target.value)}
                              className="text-center"
                              min="1"
                              max="500"
                            />
                            <Badge variant="secondary" className="shrink-0">
                              {Math.round(originalDimensions.width * parseFloat(percentageScale) / 100)}×{Math.round(originalDimensions.height * parseFloat(percentageScale) / 100)}px
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            100% = original size • 50% = half size • 200% = double size
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Advanced Settings */}
                    <div className="space-y-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Advanced Settings</Label>
                        <Badge variant="outline" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Pro Features
                        </Badge>
                      </div>

                      {/* Quality Algorithm */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Resize Algorithm</Label>
                        <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as 'smooth' | 'high-quality' | 'pixelated')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-quality">High Quality (Recommended)</SelectItem>
                            <SelectItem value="smooth">Smooth</SelectItem>
                            <SelectItem value="pixelated">Pixelated (8-bit style)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sharpening */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Image Sharpening</Label>
                          <Badge variant="secondary" className="text-xs">
                            {sharpenStrength[0] === 0 ? 'Off' : `${Math.round(sharpenStrength[0] * 100)}%`}
                          </Badge>
                        </div>
                        <Slider
                          value={sharpenStrength}
                          onValueChange={setSharpenStrength}
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enhance image clarity and detail definition
                        </p>
                      </div>

                      {/* Output Format */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'png' | 'jpeg' | 'webp')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="png">PNG (Lossless)</SelectItem>
                            <SelectItem value="jpeg">JPEG (Smaller size)</SelectItem>
                            <SelectItem value="webp">WebP (Modern)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quality Slider for JPEG/WebP */}
                      {outputFormat !== 'png' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Output Quality</Label>
                            <Badge variant="secondary" className="text-xs">
                              {outputQuality[0]}%
                            </Badge>
                          </div>
                          <Slider
                            value={outputQuality}
                            onValueChange={setOutputQuality}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}

                      {/* Aspect Ratio Toggle */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="aspect-ratio" className="text-sm font-medium">Maintain Aspect Ratio</Label>
                          <p className="text-xs text-muted-foreground">Prevent image distortion</p>
                        </div>
                        <Switch
                          id="aspect-ratio"
                          checked={maintainAspectRatio}
                          onCheckedChange={setMaintainAspectRatio}
                        />
                      </div>
                    </div>

                    {/* Resize Button */}
                    <Button 
                      onClick={resizeImageHandler} 
                      disabled={loading} 
                      size="lg" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-medium hover:shadow-strong"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Enhancing Image...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Resize & Enhance
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview Section */}
                <div className="space-y-6 animate-slide-up">
                  <ImagePreview
                    originalImage={originalImage}
                    processedImage={processedImage}
                    originalSize={originalSize}
                    processedSize={processedSize}
                    onDownload={handleDownload}
                    loading={loading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resize;