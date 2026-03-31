import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageLoad: (file: File, imageUrl: string) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number;
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
    if (files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setUploadedImage(null);
    if (onClear) onClear();
  }, [onClear]);

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer ${
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border/60 hover:border-primary/40 hover:bg-muted/20"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ImagePlus className="w-7 h-7 text-primary" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold">
              {isDragging ? "Drop your image here" : "Drop image here or click to upload"}
            </h3>
            <p className="text-muted-foreground text-sm">
              JPG, PNG, WEBP, GIF • Max {maxSize}MB
            </p>
          </div>

          <Button variant="outline" type="button" className="pointer-events-none">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {uploadedImage && (
        <div className="relative group rounded-xl overflow-hidden border bg-muted/20">
          <img 
            src={uploadedImage} 
            alt="Uploaded preview" 
            className="w-full max-h-52 object-contain p-3"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
