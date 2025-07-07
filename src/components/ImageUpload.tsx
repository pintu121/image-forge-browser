import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageLoad: (file: File, imageUrl: string) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUpload = ({ 
  onImageLoad, 
  onClear, 
  accept = "image/*",
  maxSize = 10 
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    onImageLoad(file, imageUrl);
    toast.success("Image uploaded successfully!");
  }, [onImageLoad, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setUploadedImage(null);
    if (onClear) onClear();
  }, [onClear]);

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? "Drop your image here" : "Upload an image"}
            </h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop or click to select • Max {maxSize}MB • JPG, PNG, WEBP, GIF
            </p>
          </div>

          <Button variant="outline" type="button">
            Choose File
          </Button>
        </div>
      </div>

      {uploadedImage && (
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Uploaded preview" 
            className="w-full max-h-48 object-contain rounded-lg border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};