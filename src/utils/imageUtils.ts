// Image processing utilities

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string = 'image/png', quality: number = 1): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      mimeType,
      quality
    );
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const resizeImage = (
  image: HTMLImageElement, 
  width: number, 
  height: number, 
  maintainAspectRatio: boolean = true
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (maintainAspectRatio) {
    const aspectRatio = image.width / image.height;
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }
  }

  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const compressImage = (
  image: HTMLImageElement,
  quality: number,
  maxWidth?: number,
  maxHeight?: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  let { width, height } = image;

  // Resize if max dimensions specified
  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const cropImage = (
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  return canvas;
};

export const convertImageFormat = async (
  image: HTMLImageElement,
  format: string,
  quality: number = 1
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = image.width;
  canvas.height = image.height;
  
  // For JPG, fill white background to avoid transparency issues
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.drawImage(image, 0, 0);
  
  return canvasToBlob(canvas, format, quality);
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return loadImageFromFile(file).then(img => ({
    width: img.naturalWidth,
    height: img.naturalHeight
  }));
};