import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { loadImageFromFile, canvasToBlob, downloadBlob, compressImage, optimizeForWeb, sharpenImage } from "@/utils/imageUtils";
import { Zap, Settings2, Target, Sparkles, FileDown, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const Compress = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  // Compression settings
  const [compressionMode, setCompressionMode] = useState<"quality" | "size">("quality");
  const [quality, setQuality] = useState([80]);
  const [targetSize, setTargetSize] = useState<string>("500");
  const [customTargetSize, setCustomTargetSize] = useState<string>("");
  
  // Advanced settings
  const [algorithm, setAlgorithm] = useState<'standard' | 'smart' | 'aggressive'>('smart');
  const [outputFormat, setOutputFormat] = useState<'auto' | 'jpeg' | 'webp'>('auto');
  const [preserveClarity, setPreserveClarity] = useState(true);
  const [sharpenStrength, setSharpenStrength] = useState([0.2]);
  const [maxDimensions, setMaxDimensions] = useState([1920]);
  const [progressiveJpeg, setProgressiveJpeg] = useState(true);

  const handleImageLoad = useCallback((file: File, imageUrl: string) => {
    setOriginalFile(file);
    setOriginalImage(imageUrl);
    setOriginalSize(file.size);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);
  }, []);

  const compressImageHandler = useCallback(async () => {
    if (!originalFile) return;

    setLoading(true);
    try {
      const img = await loadImageFromFile(originalFile);
      
      let canvas: HTMLCanvasElement;
      let blob: Blob;

      if (compressionMode === "quality") {
        // Quality-based compression
        const targetQuality = quality[0] / 100;
        
        // Apply max dimensions if needed
        let maxWidth: number | undefined;
        let maxHeight: number | undefined;
        
        if (img.width > maxDimensions[0] || img.height > maxDimensions[0]) {
          if (img.width > img.height) {
            maxWidth = maxDimensions[0];
            maxHeight = (maxDimensions[0] * img.height) / img.width;
          } else {
            maxHeight = maxDimensions[0];
            maxWidth = (maxDimensions[0] * img.width) / img.height;
          }
        }

        canvas = compressImage(img, targetQuality, maxWidth, maxHeight, algorithm);
        
        // Apply sharpening for clarity if enabled
        if (preserveClarity && sharpenStrength[0] > 0) {
          canvas = sharpenImage(canvas, sharpenStrength[0]);
        }

        // Convert to blob with selected format
        if (outputFormat === 'auto') {
          blob = await optimizeForWeb(img, 1000, targetQuality, 'auto');
        } else {
          const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
          blob = await canvasToBlob(canvas, mimeType, targetQuality);
        }
      } else {
        // Size-based compression
        const targetSizeKB = customTargetSize ? 
          parseInt(customTargetSize) : 
          parseInt(targetSize);
        
        const targetQuality = quality[0] / 100;
        blob = await optimizeForWeb(img, targetSizeKB, targetQuality, outputFormat);
      }

      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      
      const savings = ((originalSize - blob.size) / originalSize) * 100;
      const format = blob.type.split('/')[1].toUpperCase();
      toast.success(`Image compressed to ${format}! ${savings.toFixed(1)}% size reduction`);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error("Failed to compress image");
    } finally {
      setLoading(false);
    }
  }, [originalFile, compressionMode, quality, targetSize, customTargetSize, algorithm, outputFormat, preserveClarity, sharpenStrength, maxDimensions, originalSize]);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile) return;
    
    const extension = processedBlob.type.split('/')[1];
    const baseName = originalFile.name.split('.')[0];
    downloadBlob(processedBlob, `${baseName}_compressed.${extension}`);
  }, [processedBlob, originalFile]);

  const handleClear = useCallback(() => {
    setOriginalFile(null);
    setOriginalImage("");
    setProcessedImage("");
    setOriginalSize(0);
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
              <Zap className="w-4 h-4" />
              Smart Image Compressor
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Intelligent Compression
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered compression with clarity preservation, smart format selection, and optimal size reduction
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
                      Support for JPG, PNG, WebP • Advanced compression happens locally
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
                        <CardTitle className="text-xl">Compression Settings</CardTitle>
                        <CardDescription>
                          Original: {formatFileSize(originalSize)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Compression Mode */}
                    <Tabs value={compressionMode} onValueChange={(value) => setCompressionMode(value as "quality" | "size")}>
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                        <TabsTrigger value="quality" className="text-sm">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Quality Mode
                        </TabsTrigger>
                        <TabsTrigger value="size" className="text-sm">
                          <Target className="w-4 h-4 mr-2" />
                          Target Size
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="quality" className="space-y-4 mt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Quality Level</Label>
                            <Badge variant="secondary" className="text-xs">
                              {quality[0]}%
                            </Badge>
                          </div>
                          <Slider
                            value={quality}
                            onValueChange={setQuality}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Higher quality preserves more detail but increases file size
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Max Dimensions</Label>
                            <Badge variant="secondary" className="text-xs">
                              {maxDimensions[0]}px
                            </Badge>
                          </div>
                          <Slider
                            value={maxDimensions}
                            onValueChange={setMaxDimensions}
                            max={4096}
                            min={512}
                            step={128}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Images larger than this will be resized proportionally
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="size" className="space-y-4 mt-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Target File Size</Label>
                          <div className="flex gap-2">
                            <Select value={targetSize} onValueChange={setTargetSize}>
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50 KB</SelectItem>
                                <SelectItem value="100">100 KB</SelectItem>
                                <SelectItem value="200">200 KB</SelectItem>
                                <SelectItem value="500">500 KB</SelectItem>
                                <SelectItem value="1000">1 MB</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {targetSize === "custom" && (
                              <Input
                                type="number"
                                placeholder="KB"
                                value={customTargetSize}
                                onChange={(e) => setCustomTargetSize(e.target.value)}
                                className="w-20"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Base Quality</Label>
                            <Badge variant="secondary" className="text-xs">
                              {quality[0]}%
                            </Badge>
                          </div>
                          <Slider
                            value={quality}
                            onValueChange={setQuality}
                            max={100}
                            min={10}
                            step={5}
                            className="w-full"
                          />
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

                      {/* Compression Algorithm */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Compression Algorithm</Label>
                        <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as 'standard' | 'smart' | 'aggressive')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smart">Smart (Recommended)</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Output Format */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Output Format</Label>
                        <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'auto' | 'jpeg' | 'webp')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Smallest)</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                            <SelectItem value="webp">WebP (Modern)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Clarity Preservation */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <Label htmlFor="clarity" className="text-sm font-medium">Preserve Clarity</Label>
                            <p className="text-xs text-muted-foreground">Apply sharpening to maintain detail</p>
                          </div>
                          <Switch
                            id="clarity"
                            checked={preserveClarity}
                            onCheckedChange={setPreserveClarity}
                          />
                        </div>

                        {preserveClarity && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Sharpening Strength</Label>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(sharpenStrength[0] * 100)}%
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
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compress Button */}
                    <Button 
                      onClick={compressImageHandler} 
                      disabled={loading} 
                      size="lg" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-medium hover:shadow-strong"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Compressing...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 mr-2" />
                          Compress Image
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

export default Compress;