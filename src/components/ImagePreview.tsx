import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  if (!originalImage && !processedImage) return null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Original</h3>
            {originalSize ? (
              <Badge variant="secondary" className="text-xs font-mono">{formatFileSize(originalSize)}</Badge>
            ) : null}
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/40 p-4 min-h-[200px] flex items-center justify-center">
            {originalImage ? (
              <img src={originalImage} alt="Original" className="max-w-full max-h-52 object-contain rounded-lg" />
            ) : (
              <p className="text-muted-foreground text-sm">No image selected</p>
            )}
          </div>
        </div>

        {/* Processed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Processed</h3>
            {processedSize ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">{formatFileSize(processedSize)}</Badge>
                {getSavings() && (
                  <Badge className="text-xs bg-success/10 text-success border-success/20">
                    -{getSavings()}%
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
          <div className="bg-muted/20 rounded-xl border border-border/40 p-4 min-h-[200px] flex items-center justify-center">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground text-sm">Processing...</span>
              </div>
            ) : processedImage ? (
              <img src={processedImage} alt="Processed" className="max-w-full max-h-52 object-contain rounded-lg" />
            ) : (
              <div className="text-center space-y-2">
                <ArrowRight className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground text-sm">Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {processedImage && onDownload && (
        <div className="text-center">
          <Button onClick={onDownload} size="lg" className="bg-gradient-primary hover:opacity-90 transition-all shadow-medium hover:shadow-strong gap-2">
            <Download className="w-4 h-4" />
            Download Processed Image
          </Button>
        </div>
      )}
    </div>
  );
};
