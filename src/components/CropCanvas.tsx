import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, FabricImage, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Move, Crop, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CropCanvasProps {
  imageUrl: string;
  onCrop: (croppedCanvas: HTMLCanvasElement, settings: CropSettings) => void;
}

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

const aspectRatios = [
  { label: "Free Form", value: "free", icon: "🆓" },
  { label: "1:1 Square", value: "1:1", icon: "⬜" },
  { label: "4:3 Standard", value: "4:3", icon: "📺" },
  { label: "16:9 Widescreen", value: "16:9", icon: "🖥️" },
  { label: "3:2 Photography", value: "3:2", icon: "📷" },
  { label: "2:3 Portrait", value: "2:3", icon: "📱" },
  { label: "9:16 Story", value: "9:16", icon: "📲" },
  { label: "4:5 Instagram", value: "4:5", icon: "📸" },
  { label: "21:9 Cinema", value: "21:9", icon: "🎬" },
];

export const CropCanvas = ({ imageUrl, onCrop }: CropCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  
  // Transform controls
  const [zoom, setZoom] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [sharpening, setSharpening] = useState([0]);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Output settings
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [outputQuality, setOutputQuality] = useState([90]);
  const [showGrid, setShowGrid] = useState(true);
  const [cropPreview, setCropPreview] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 900,
      height: 600,
      backgroundColor: "#fafafa",
    });

    // Load the image
    FabricImage.fromURL(imageUrl)
      .then((img) => {
        // Scale image to fit canvas
        const canvasWidth = 900;
        const canvasHeight = 600;
        const imgWidth = img.width!;
        const imgHeight = img.height!;
        
        const scale = Math.min((canvasWidth * 0.8) / imgWidth, (canvasHeight * 0.8) / imgHeight);
        
        img.scale(scale);
        img.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        setOriginalImage(img);

        // Create initial crop rectangle
        const cropSize = Math.min(imgWidth * scale, imgHeight * scale) * 0.7;
        const rect = new Rect({
          left: img.left! + (imgWidth * scale - cropSize) / 2,
          top: img.top! + (imgHeight * scale - cropSize) / 2,
          width: cropSize,
          height: cropSize,
          fill: "rgba(0, 123, 255, 0.1)",
          stroke: "#007bff",
          strokeWidth: 2,
          strokeDashArray: showGrid ? [5, 5] : [],
          cornerStyle: "circle",
          cornerColor: "#007bff",
          cornerSize: 10,
          transparentCorners: false,
          borderColor: "#007bff",
          borderScaleFactor: 2,
        });

        // Add crop preview update on rectangle change
        rect.on('modified', () => {
          updateCropPreview();
        });

        canvas.add(rect);
        setCropRect(rect);
        canvas.renderAll();
        updateCropPreview();
      })
      .catch((error) => {
        console.error("Error loading image:", error);
        toast.error("Failed to load image");
      });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl, showGrid]);

  const updateCropPreview = useCallback(() => {
    if (!fabricCanvas || !cropRect || !originalImage) return;

    try {
      // Create a small preview of the crop area
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      
      const previewSize = 120;
      tempCanvas.width = previewSize;
      tempCanvas.height = previewSize;
      
      const scaleX = originalImage.scaleX!;
      const scaleY = originalImage.scaleY!;
      
      const cropX = (cropRect.left! - originalImage.left!) / scaleX;
      const cropY = (cropRect.top! - originalImage.top!) / scaleY;
      const cropWidth = cropRect.width! / scaleX;
      const cropHeight = cropRect.height! / scaleY;
      
      const img = new Image();
      img.onload = () => {
        const aspectRatio = cropWidth / cropHeight;
        let drawW = previewSize;
        let drawH = previewSize;
        
        if (aspectRatio > 1) {
          drawH = previewSize / aspectRatio;
        } else {
          drawW = previewSize * aspectRatio;
        }
        
        const offsetX = (previewSize - drawW) / 2;
        const offsetY = (previewSize - drawH) / 2;
        
        tempCtx.fillStyle = '#f5f5f5';
        tempCtx.fillRect(0, 0, previewSize, previewSize);
        
        tempCtx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          offsetX, offsetY, drawW, drawH
        );
        
        setCropPreview(tempCanvas.toDataURL());
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Preview error:', error);
    }
  }, [fabricCanvas, cropRect, originalImage, imageUrl]);

  const updateCropRectangle = useCallback((ratio: string) => {
    if (!cropRect || !originalImage || !fabricCanvas) return;

    if (ratio === "free") {
      cropRect.set({ lockUniScaling: false });
      fabricCanvas.renderAll();
      return;
    }

    const [widthRatio, heightRatio] = ratio.split(":").map(Number);
    const aspectValue = widthRatio / heightRatio;

    // Lock aspect ratio
    cropRect.set({ 
      lockUniScaling: true,
    });

    // Adjust current dimensions to match aspect ratio
    const currentWidth = cropRect.width!;
    const currentHeight = currentWidth / aspectValue;

    // Make sure it fits within the image bounds
    const maxWidth = originalImage.width! * originalImage.scaleX!;
    const maxHeight = originalImage.height! * originalImage.scaleY!;

    let newWidth = currentWidth;
    let newHeight = currentHeight;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectValue;
    }
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectValue;
    }

    cropRect.set({
      width: newWidth,
      height: newHeight,
    });

    fabricCanvas.renderAll();
    updateCropPreview();
  }, [cropRect, originalImage, fabricCanvas, updateCropPreview]);

  useEffect(() => {
    updateCropRectangle(aspectRatio);
  }, [aspectRatio, updateCropRectangle]);

  const applyTransforms = useCallback(() => {
    if (!originalImage || !fabricCanvas) return;

    const transforms = {
      rotation: rotation[0],
      scaleX: flipH ? -originalImage.scaleX! : originalImage.scaleX!,
      scaleY: flipV ? -originalImage.scaleY! : originalImage.scaleY!,
    };

    originalImage.set(transforms);
    fabricCanvas.renderAll();
    updateCropPreview();
  }, [originalImage, fabricCanvas, rotation, flipH, flipV, updateCropPreview]);

  useEffect(() => {
    applyTransforms();
  }, [rotation, flipH, flipV, applyTransforms]);

  const handleZoom = useCallback((zoomValue: number) => {
    if (!originalImage || !fabricCanvas) return;
    
    const currentScale = originalImage.scaleX!;
    const newScale = currentScale * (zoomValue / zoom[0]);
    
    originalImage.scale(newScale);
    fabricCanvas.renderAll();
    updateCropPreview();
  }, [originalImage, fabricCanvas, zoom, updateCropPreview]);

  const handleCrop = useCallback(() => {
    if (!fabricCanvas || !cropRect || !originalImage) return;

    const settings: CropSettings = {
      format: outputFormat,
      quality: outputQuality[0] / 100,
      brightness: brightness[0],
      contrast: contrast[0],
      sharpening: sharpening[0] / 100,
      rotation: rotation[0],
      flipH,
      flipV,
    };

    try {
      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;

      // Calculate crop dimensions relative to original image
      const scaleX = originalImage.scaleX!;
      const scaleY = originalImage.scaleY!;
      
      const cropX = (cropRect.left! - originalImage.left!) / Math.abs(scaleX);
      const cropY = (cropRect.top! - originalImage.top!) / Math.abs(scaleY);
      const cropWidth = cropRect.width! / Math.abs(scaleX);
      const cropHeight = cropRect.height! / Math.abs(scaleY);

      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;

      // Load original image and crop it
      const img = new Image();
      img.onload = () => {
        tempCtx.save();
        
        // Apply flips
        if (flipH || flipV) {
          tempCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          tempCtx.translate(flipH ? -cropWidth : 0, flipV ? -cropHeight : 0);
        }
        
        tempCtx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        tempCtx.restore();
        
        onCrop(tempCanvas, settings);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Crop error:', error);
      toast.error("Failed to crop image");
    }
  }, [fabricCanvas, cropRect, originalImage, imageUrl, onCrop, outputFormat, outputQuality, brightness, contrast, sharpening, rotation, flipH, flipV]);

  const resetCrop = useCallback(() => {
    if (!originalImage || !fabricCanvas) return;

    const cropSize = Math.min(
      originalImage.width! * Math.abs(originalImage.scaleX!),
      originalImage.height! * Math.abs(originalImage.scaleY!)
    ) * 0.7;

    if (cropRect) {
      cropRect.set({
        left: originalImage.left! + (originalImage.width! * Math.abs(originalImage.scaleX!) - cropSize) / 2,
        top: originalImage.top! + (originalImage.height! * Math.abs(originalImage.scaleY!) - cropSize) / 2,
        width: cropSize,
        height: cropSize,
      });
      
      fabricCanvas.renderAll();
      updateCropPreview();
    }
  }, [originalImage, fabricCanvas, cropRect, updateCropPreview]);

  const quickRotate = useCallback((angle: number) => {
    const newRotation = (rotation[0] + angle) % 360;
    setRotation([newRotation]);
  }, [rotation]);

  return (
    <div className="space-y-6">
      {/* Header with Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Advanced Crop Editor</div>
          {cropPreview && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Preview:</div>
              <div className="w-12 h-12 border-2 border-primary/20 rounded-lg overflow-hidden">
                <img src={cropPreview} alt="Crop preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
        
        <Badge variant="outline" className="text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          Pro Editor
        </Badge>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardContent className="p-6">
          <Tabs defaultValue="crop" className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50">
              <TabsTrigger value="crop" className="text-sm">
                <Crop className="w-4 h-4 mr-1" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="transform" className="text-sm">
                <Move className="w-4 h-4 mr-1" />
                Transform
              </TabsTrigger>
              <TabsTrigger value="adjust" className="text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                Enhance
              </TabsTrigger>
              <TabsTrigger value="output" className="text-sm">
                Output
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="crop" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={aspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatio(ratio.value)}
                    className="justify-start text-xs"
                  >
                    <span className="mr-2">{ratio.icon}</span>
                    {ratio.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                  <Label htmlFor="grid" className="text-sm">Show Grid</Label>
                </div>
                <Button variant="outline" size="sm" onClick={resetCrop}>
                  Reset Crop
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="transform" className="space-y-6 mt-6">
              {/* Rotation & Flip */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Rotation</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => quickRotate(-90)}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => quickRotate(90)}>
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={rotation}
                  onValueChange={setRotation}
                  max={360}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {rotation[0]}°
                </div>
              </div>

              {/* Flip Controls */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={flipH ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipH(!flipH)}
                >
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Flip H
                </Button>
                <Button
                  variant={flipV ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFlipV(!flipV)}
                >
                  <FlipVertical className="w-4 h-4 mr-2" />
                  Flip V
                </Button>
              </div>

              {/* Zoom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Zoom</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => {
                      const newZoom = Math.max(25, zoom[0] - 25);
                      setZoom([newZoom]);
                      handleZoom(newZoom);
                    }}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const newZoom = Math.min(400, zoom[0] + 25);
                      setZoom([newZoom]);
                      handleZoom(newZoom);
                    }}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={zoom}
                  onValueChange={(value) => {
                    setZoom(value);
                    handleZoom(value[0]);
                  }}
                  max={400}
                  min={25}
                  step={25}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {zoom[0]}%
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="adjust" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Brightness */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Brightness</Label>
                    <Badge variant="secondary" className="text-xs">
                      {brightness[0] > 0 ? '+' : ''}{brightness[0]}
                    </Badge>
                  </div>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    min={-100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Contrast</Label>
                    <Badge variant="secondary" className="text-xs">
                      {contrast[0] > 0 ? '+' : ''}{contrast[0]}
                    </Badge>
                  </div>
                  <Slider
                    value={contrast}
                    onValueChange={setContrast}
                    max={100}
                    min={-100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Sharpening */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Sharpening</Label>
                    <Badge variant="secondary" className="text-xs">
                      {sharpening[0]}%
                    </Badge>
                  </div>
                  <Slider
                    value={sharpening}
                    onValueChange={setSharpening}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'png' | 'jpeg' | 'webp')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="jpeg">JPEG (Smaller)</SelectItem>
                      <SelectItem value="webp">WebP (Modern)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {outputFormat !== 'png' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Quality</Label>
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="border-2 border-dashed border-border rounded-xl overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 p-4">
        <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-medium" />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={resetCrop}>
          Reset All
        </Button>
        <Button 
          onClick={handleCrop}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 px-8"
        >
          <Crop className="w-4 h-4 mr-2" />
          Apply Crop & Enhance
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Drag corners to resize • Use transform controls for rotation and flip • Enhance tab for image quality adjustments
      </p>
    </div>
  );
};