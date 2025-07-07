import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, FabricImage, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CropCanvasProps {
  imageUrl: string;
  onCrop: (croppedCanvas: HTMLCanvasElement) => void;
}

const aspectRatios = [
  { label: "Free", value: "free" },
  { label: "1:1 (Square)", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "3:2", value: "3:2" },
  { label: "2:3 (Portrait)", value: "2:3" },
];

export const CropCanvas = ({ imageUrl, onCrop }: CropCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f5f5f5",
    });

    // Load the image
    FabricImage.fromURL(imageUrl)
      .then((img) => {
        // Scale image to fit canvas
        const canvasWidth = 800;
        const canvasHeight = 600;
        const imgWidth = img.width!;
        const imgHeight = img.height!;
        
        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
        
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
        const cropSize = Math.min(imgWidth * scale, imgHeight * scale) * 0.8;
        const rect = new Rect({
          left: img.left! + (imgWidth * scale - cropSize) / 2,
          top: img.top! + (imgHeight * scale - cropSize) / 2,
          width: cropSize,
          height: cropSize,
          fill: "transparent",
          stroke: "#007bff",
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          cornerStyle: "circle",
          cornerColor: "#007bff",
          cornerSize: 8,
          transparentCorners: false,
        });

        canvas.add(rect);
        setCropRect(rect);
        canvas.renderAll();
      })
      .catch((error) => {
        console.error("Error loading image:", error);
        toast.error("Failed to load image");
      });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

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
  }, [cropRect, originalImage, fabricCanvas]);

  useEffect(() => {
    updateCropRectangle(aspectRatio);
  }, [aspectRatio, updateCropRectangle]);

  const handleCrop = useCallback(() => {
    if (!fabricCanvas || !cropRect || !originalImage) return;

    try {
      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;

      // Calculate crop dimensions relative to original image
      const scaleX = originalImage.scaleX!;
      const scaleY = originalImage.scaleY!;
      
      const cropX = (cropRect.left! - originalImage.left!) / scaleX;
      const cropY = (cropRect.top! - originalImage.top!) / scaleY;
      const cropWidth = cropRect.width! / scaleX;
      const cropHeight = cropRect.height! / scaleY;

      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;

      // Load original image and crop it
      const img = new Image();
      img.onload = () => {
        tempCtx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        onCrop(tempCanvas);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Crop error:', error);
      toast.error("Failed to crop image");
    }
  }, [fabricCanvas, cropRect, originalImage, imageUrl, onCrop]);

  const resetCrop = useCallback(() => {
    if (!originalImage || !fabricCanvas) return;

    const cropSize = Math.min(
      originalImage.width! * originalImage.scaleX!,
      originalImage.height! * originalImage.scaleY!
    ) * 0.8;

    if (cropRect) {
      cropRect.set({
        left: originalImage.left! + (originalImage.width! * originalImage.scaleX! - cropSize) / 2,
        top: originalImage.top! + (originalImage.height! * originalImage.scaleY! - cropSize) / 2,
        width: cropSize,
        height: cropSize,
      });
      
      fabricCanvas.renderAll();
    }
  }, [originalImage, fabricCanvas, cropRect]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Aspect Ratio:</label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aspectRatios.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetCrop}>
            Reset
          </Button>
          <Button onClick={handleCrop}>
            Apply Crop
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Drag the corners and edges of the blue rectangle to adjust your crop area
      </p>
    </div>
  );
};