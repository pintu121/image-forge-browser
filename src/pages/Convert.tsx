import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { loadImageFromFile, convertImageFormat, downloadBlob } from "@/utils/imageUtils";
import { RotateCcw, Sparkles, Image as ImageIcon, Settings2 } from "lucide-react";
import { toast } from "sonner";

const formats = [
  { label: "PNG", value: "image/png", extension: "png", desc: "Lossless, transparent" },
  { label: "JPEG", value: "image/jpeg", extension: "jpg", desc: "Smaller, photos" },
  { label: "WEBP", value: "image/webp", extension: "webp", desc: "Modern, smallest" },
  { label: "BMP", value: "image/bmp", extension: "bmp", desc: "Uncompressed" },
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12 px-4 space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium">
              <RotateCcw className="w-4 h-4" />
              Format Converter
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Convert Formats
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Instantly convert images between JPG, PNG, WEBP, and BMP formats with quality control
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Upload */}
            <Card className="overflow-hidden bg-gradient-card border-0 shadow-soft animate-slide-up">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Upload Your Image</CardTitle>
                    <CardDescription>Choose an image to convert to a different format</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload onImageLoad={handleImageLoad} onClear={handleClear} />
              </CardContent>
            </Card>

            {originalFile && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Settings */}
                <Card className="bg-gradient-card border-0 shadow-soft animate-slide-up">
                  <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Settings2 className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Conversion Settings</CardTitle>
                        <CardDescription>Select target format and quality</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Target Format</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {formats.map((format) => (
                          <button
                            key={format.value}
                            onClick={() => setTargetFormat(format.value)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              targetFormat === format.value
                                ? "border-primary bg-primary/5"
                                : "border-border/40 hover:border-primary/30 hover:bg-muted/20"
                            }`}
                          >
                            <span className="font-semibold text-sm">{format.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{format.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(targetFormat === "image/jpeg" || targetFormat === "image/webp") && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Quality</Label>
                          <Badge variant="secondary" className="text-xs">{quality[0]}%</Badge>
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
                          Higher quality = larger file size
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={convertImage}
                      disabled={loading}
                      size="lg"
                      className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-medium hover:shadow-strong"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Convert Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview */}
                <div className="animate-slide-up">
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

export default Convert;
