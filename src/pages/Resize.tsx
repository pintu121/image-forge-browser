import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadImageFromFile, canvasToBlob, downloadBlob, resizeImage } from "@/utils/imageUtils";
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

      const canvas = resizeImage(img, targetWidth, targetHeight, maintainAspectRatio);
      const blob = await canvasToBlob(canvas, 'image/png', 1);

      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      
      toast.success(`Image resized to ${targetWidth}x${targetHeight}px`);
    } catch (error) {
      console.error('Resize error:', error);
      toast.error("Failed to resize image");
    } finally {
      setLoading(false);
    }
  }, [originalFile, resizeMode, newWidth, newHeight, percentageScale, maintainAspectRatio]);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile) return;
    
    const baseName = originalFile.name.split('.')[0];
    downloadBlob(processedBlob, `${baseName}_resized.png`);
  }, [processedBlob, originalFile]);

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
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Resizer</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Resize your images to custom dimensions or by percentage. Maintain aspect ratio or stretch to fit.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Choose an image to resize. All processing happens in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
            </CardContent>
          </Card>

          {originalFile && (
            <Card>
              <CardHeader>
                <CardTitle>Resize Settings</CardTitle>
                <CardDescription>
                  Original size: {originalDimensions.width}x{originalDimensions.height}px
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={resizeMode} onValueChange={(value) => setResizeMode(value as "dimensions" | "percentage")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dimensions">Custom Dimensions</TabsTrigger>
                    <TabsTrigger value="percentage">Percentage Scale</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dimensions" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width">Width (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={newWidth}
                          onChange={(e) => updateDimensions(e.target.value, newHeight, true)}
                          placeholder="Width"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={newHeight}
                          onChange={(e) => updateDimensions(newWidth, e.target.value, false)}
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="percentage" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Scale Percentage</Label>
                      <Input
                        id="percentage"
                        type="number"
                        value={percentageScale}
                        onChange={(e) => setPercentageScale(e.target.value)}
                        placeholder="100"
                        min="1"
                        max="500"
                      />
                      <p className="text-xs text-muted-foreground">
                        100% = original size, 50% = half size, 200% = double size
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onCheckedChange={setMaintainAspectRatio}
                  />
                  <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
                </div>

                <Button 
                  onClick={resizeImageHandler} 
                  disabled={loading} 
                  size="lg" 
                  className="w-full"
                >
                  {loading ? "Resizing..." : "Resize Image"}
                </Button>
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
      </div>
    </Layout>
  );
};

export default Resize;