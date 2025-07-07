import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ImagePreviewProps {
  originalImage?: string;
  processedImage?: string;
  originalSize?: number;
  processedSize?: number;
  onDownload?: () => void;
  loading?: boolean;
}

export const ImagePreview = ({
  originalImage,
  processedImage,
  originalSize,
  processedSize,
  onDownload,
  loading = false
}: ImagePreviewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavings = () => {
    if (!originalSize || !processedSize) return null;
    const savings = ((originalSize - processedSize) / originalSize) * 100;
    return savings > 0 ? savings.toFixed(1) : null;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Original</h3>
          <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            {originalImage ? (
              <img 
                src={originalImage} 
                alt="Original" 
                className="max-w-full max-h-48 object-contain rounded"
              />
            ) : (
              <p className="text-muted-foreground">No image selected</p>
            )}
          </div>
          {originalSize && (
            <p className="text-center text-sm text-muted-foreground">
              Size: {formatFileSize(originalSize)}
            </p>
          )}
        </div>

        {/* Processed Image */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Processed</h3>
          <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-muted-foreground">Processing...</span>
              </div>
            ) : processedImage ? (
              <img 
                src={processedImage} 
                alt="Processed" 
                className="max-w-full max-h-48 object-contain rounded"
              />
            ) : (
              <p className="text-muted-foreground">Upload and process an image</p>
            )}
          </div>
          {processedSize && (
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                Size: {formatFileSize(processedSize)}
              </p>
              {getSavings() && (
                <p className="text-sm text-success font-medium">
                  {getSavings()}% smaller
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {processedImage && onDownload && (
        <div className="text-center">
          <Button onClick={onDownload} size="lg" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download Processed Image
          </Button>
        </div>
      )}
    </div>
  );
};