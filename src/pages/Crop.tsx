import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { CropCanvas } from "@/components/CropCanvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canvasToBlob, downloadBlob } from "@/utils/imageUtils";
import { toast } from "sonner";

const Crop = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [showCropTool, setShowCropTool] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const handleImageLoad = useCallback((file: File, imageUrl: string) => {
    setOriginalFile(file);
    setOriginalImage(imageUrl);
    setOriginalSize(file.size);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);
    setShowCropTool(true);
  }, []);

  const handleCrop = useCallback(async (croppedCanvas: HTMLCanvasElement) => {
    try {
      const blob = await canvasToBlob(croppedCanvas, 'image/png', 1);
      
      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      setShowCropTool(false);
      
      toast.success("Image cropped successfully!");
    } catch (error) {
      console.error('Crop processing error:', error);
      toast.error("Failed to process cropped image");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile) return;
    
    const baseName = originalFile.name.split('.')[0];
    downloadBlob(processedBlob, `${baseName}_cropped.png`);
  }, [processedBlob, originalFile]);

  const handleClear = useCallback(() => {
    setOriginalFile(null);
    setOriginalImage("");
    setProcessedImage("");
    setOriginalSize(0);
    setProcessedSize(0);
    setProcessedBlob(null);
    setShowCropTool(false);
  }, []);

  const handleEditAgain = useCallback(() => {
    setShowCropTool(true);
    setProcessedImage("");
    setProcessedSize(0);
    setProcessedBlob(null);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Cropper</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Crop your images with precision. Use preset aspect ratios or freeform selection for perfect framing.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {!originalFile && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Choose an image to crop. All processing happens in your browser.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
              </CardContent>
            </Card>
          )}

          {showCropTool && originalImage && (
            <Card>
              <CardHeader>
                <CardTitle>Crop Your Image</CardTitle>
                <CardDescription>
                  Drag the crop rectangle to select the area you want to keep. Choose an aspect ratio or use freeform selection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CropCanvas imageUrl={originalImage} onCrop={handleCrop} />
              </CardContent>
            </Card>
          )}

          {!showCropTool && originalFile && (
            <ImagePreview
              originalImage={originalImage}
              processedImage={processedImage}
              originalSize={originalSize}
              processedSize={processedSize}
              onDownload={handleDownload}
              loading={false}
            />
          )}

          {processedImage && (
            <div className="text-center space-x-4">
              <button
                onClick={handleEditAgain}
                className="text-primary hover:underline text-sm"
              >
                Crop Again
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Upload New Image
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Crop;