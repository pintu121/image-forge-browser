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
  maintainAspectRatio: boolean = true,
  algorithm: 'smooth' | 'high-quality' | 'pixelated' = 'high-quality'
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
  
  // Set image smoothing based on algorithm
  switch (algorithm) {
    case 'smooth':
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      break;
    case 'high-quality':
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      break;
    case 'pixelated':
      ctx.imageSmoothingEnabled = false;
      break;
  }
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const sharpenImage = (canvas: HTMLCanvasElement, strength: number = 0.5): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const sharpenKernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0
  ];
  
  const output = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * canvas.width + (x + kx)) * 4 + c;
            sum += data[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        const idx = (y * canvas.width + x) * 4 + c;
        output[idx] = Math.max(0, Math.min(255, sum));
      }
      const alphaIdx = (y * canvas.width + x) * 4 + 3;
      output[alphaIdx] = data[alphaIdx];
    }
  }
  
  const outputImageData = new ImageData(output, canvas.width, canvas.height);
  ctx.putImageData(outputImageData, 0, 0);
  return canvas;
};

export const enhanceClarity = (
  image: HTMLImageElement,
  width: number,
  height: number,
  options: {
    algorithm: 'smooth' | 'high-quality' | 'pixelated';
    sharpen: number;
    maintainAspectRatio: boolean;
  }
): HTMLCanvasElement => {
  let canvas = resizeImage(image, width, height, options.maintainAspectRatio, options.algorithm);
  
  if (options.sharpen > 0) {
    canvas = sharpenImage(canvas, options.sharpen);
  }
  
  return canvas;
};

export const compressImage = (
  image: HTMLImageElement,
  quality: number,
  maxWidth?: number,
  maxHeight?: number,
  algorithm: 'standard' | 'smart' | 'aggressive' = 'smart'
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
  
  // Apply compression algorithm settings
  switch (algorithm) {
    case 'smart':
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      break;
    case 'aggressive':
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';
      break;
    case 'standard':
    default:
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      break;
  }
  
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

export const optimizeForWeb = async (
  image: HTMLImageElement,
  targetSize: number, // in KB
  quality: number,
  format: 'jpeg' | 'webp' | 'auto' = 'auto'
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0);

  const targetBytes = targetSize * 1024;
  let currentQuality = quality;
  let bestBlob: Blob | null = null;
  let bestFormat = format;

  // Auto-select best format
  if (format === 'auto') {
    const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
    const webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
    
    bestFormat = webpBlob.size < jpegBlob.size ? 'webp' : 'jpeg';
    bestBlob = webpBlob.size < jpegBlob.size ? webpBlob : jpegBlob;
  } else {
    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
    bestBlob = await canvasToBlob(canvas, mimeType, quality);
  }

  // If still too large, reduce quality iteratively
  if (bestBlob.size > targetBytes && currentQuality > 0.1) {
    const reductionFactor = Math.sqrt(targetBytes / bestBlob.size);
    currentQuality = Math.max(0.1, currentQuality * reductionFactor);
    
    const mimeType = bestFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    bestBlob = await canvasToBlob(canvas, mimeType, currentQuality);
  }

  return bestBlob;
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