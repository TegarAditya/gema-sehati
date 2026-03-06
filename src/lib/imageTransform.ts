const MAX_IMAGE_DIMENSION = 1600;
const OUTPUT_WEBP_QUALITY = 0.8;
const OUTPUT_JPEG_QUALITY = 0.82;

export interface TransformedPhoto {
  file: File;
  width: number;
  height: number;
}

function getScaledSize(width: number, height: number): { width: number; height: number } {
  const largestSide = Math.max(width, height);
  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function fileToImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(previewUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('Gagal memproses gambar. Pastikan file valid.'));
    };

    image.src = previewUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengoptimalkan gambar.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function transformPhotoForUpload(file: File): Promise<TransformedPhoto> {
  const image = await fileToImageElement(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scaledSize = getScaledSize(sourceWidth, sourceHeight);

  const canvas = document.createElement('canvas');
  canvas.width = scaledSize.width;
  canvas.height = scaledSize.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Browser tidak mendukung proses optimasi gambar.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, scaledSize.width, scaledSize.height);

  const prefersPng = file.type === 'image/png';
  const outputMime = prefersPng ? 'image/png' : 'image/webp';
  const quality = outputMime === 'image/png' ? undefined : OUTPUT_WEBP_QUALITY;

  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas, outputMime, quality);
  } catch {
    blob = await canvasToBlob(canvas, 'image/jpeg', OUTPUT_JPEG_QUALITY);
  }

  const transformedFile = new File([blob], `optimized-${Date.now()}`, {
    type: blob.type,
    lastModified: Date.now(),
  });

  return {
    file: transformedFile,
    width: scaledSize.width,
    height: scaledSize.height,
  };
}
