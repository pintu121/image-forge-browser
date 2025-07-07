import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadImageFromFile, canvasToBlob, downloadBlob, compressImage } from "@/utils/imageUtils";
import { toast } from "sonner";

const Compress = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [quality, setQuality] = useState([80]);
  const [targetSize, setTargetSize] = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

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
      
      let targetQuality = quality[0] / 100;
      let maxWidth: number | undefined;
      let maxHeight: number | undefined;

      // Apply size-based compression
      if (targetSize !== "none") {
        const targetBytes = parseInt(targetSize) * 1024; // Convert KB to bytes
        
        // Estimate dimensions needed for target file size
        const estimatedPixels = targetBytes * 0.1; // Rough estimation
        const aspectRatio = img.width / img.height;
        
        if (aspectRatio > 1) {
          maxWidth = Math.sqrt(estimatedPixels * aspectRatio);
          maxHeight = maxWidth / aspectRatio;
        } else {
          maxHeight = Math.sqrt(estimatedPixels / aspectRatio);
          maxWidth = maxHeight * aspectRatio;
        }
      }

      const canvas = compressImage(img, targetQuality, maxWidth, maxHeight);
      
      // Try JPEG first for better compression
      let blob = await canvasToBlob(canvas, 'image/jpeg', targetQuality);
      
      // If target size specified and we're over, try WebP
      if (targetSize !== "none" && blob.size > parseInt(targetSize) * 1024) {
        blob = await canvasToBlob(canvas, 'image/webp', targetQuality * 0.8);
      }

      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      
      const savings = ((originalSize - blob.size) / originalSize) * 100;
      toast.success(`Image compressed! ${savings.toFixed(1)}% size reduction`);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error("Failed to compress image");
    } finally {
      setLoading(false);
    }
  }, [originalFile, quality, targetSize, originalSize]);

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

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Compressor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reduce your image file size while maintaining quality. Perfect for web optimization and storage savings.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Choose an image to compress. All processing happens in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
            </CardContent>
          </Card>

          {originalFile && (
            <Card>
              <CardHeader>
                <CardTitle>Compression Settings</CardTitle>
                <CardDescription>
                  Adjust quality and target file size for optimal compression.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Quality: {quality[0]}%
                  </label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher quality = larger file size
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Target File Size</label>
                  <Select value={targetSize} onValueChange={setTargetSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific target</SelectItem>
                      <SelectItem value="50">50 KB</SelectItem>
                      <SelectItem value="100">100 KB</SelectItem>
                      <SelectItem value="200">200 KB</SelectItem>
                      <SelectItem value="500">500 KB</SelectItem>
                      <SelectItem value="1000">1 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={compressImageHandler} 
                  disabled={loading} 
                  size="lg" 
                  className="w-full"
                >
                  {loading ? "Compressing..." : "Compress Image"}
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

export default Compress;