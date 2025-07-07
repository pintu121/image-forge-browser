import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadImageFromFile, convertImageFormat, downloadBlob } from "@/utils/imageUtils";
import { toast } from "sonner";

const formats = [
  { label: "PNG", value: "image/png", extension: "png" },
  { label: "JPEG", value: "image/jpeg", extension: "jpg" },
  { label: "WEBP", value: "image/webp", extension: "webp" },
  { label: "BMP", value: "image/bmp", extension: "bmp" },
];

const Convert = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [targetFormat, setTargetFormat] = useState<string>("image/png");
  const [quality, setQuality] = useState([90]);
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

  const convertImage = useCallback(async () => {
    if (!originalFile) return;

    setLoading(true);
    try {
      const img = await loadImageFromFile(originalFile);
      const blob = await convertImageFormat(img, targetFormat, quality[0] / 100);

      setProcessedBlob(blob);
      setProcessedSize(blob.size);
      setProcessedImage(URL.createObjectURL(blob));
      
      const format = formats.find(f => f.value === targetFormat);
      toast.success(`Image converted to ${format?.label} format!`);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error("Failed to convert image");
    } finally {
      setLoading(false);
    }
  }, [originalFile, targetFormat, quality]);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !originalFile) return;
    
    const format = formats.find(f => f.value === targetFormat);
    const baseName = originalFile.name.split('.')[0];
    downloadBlob(processedBlob, `${baseName}_converted.${format?.extension}`);
  }, [processedBlob, originalFile, targetFormat]);

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
          <h1 className="text-4xl font-bold mb-4">Image Converter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert images between different formats. Support for JPG, PNG, WEBP, and BMP formats.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Choose an image to convert to a different format.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
            </CardContent>
          </Card>

          {originalFile && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Target Format</label>
                  <Select value={targetFormat} onValueChange={setTargetFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(targetFormat === "image/jpeg" || targetFormat === "image/webp") && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Quality: {quality[0]}%</label>
                    <Slider
                      value={quality}
                      onValueChange={setQuality}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                <Button onClick={convertImage} disabled={loading} size="lg" className="w-full">
                  {loading ? "Converting..." : "Convert Image"}
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

export default Convert;