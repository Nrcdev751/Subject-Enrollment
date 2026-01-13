/**
 * Simulates an LBP (Local Binary Pattern) visual effect.
 * Real LBP converts pixels based on neighbors. For visual aid, 
 * we use grayscale + threshold + edge simulation.
 */
export const applyLBPVisualFilter = (
  video: HTMLVideoElement | HTMLImageElement, 
  width: number, 
  height: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  let sx, sy, sWidth, sHeight;
  
  // Handle cropping based on source aspect ratio
  // If video (has videoWidth) or image (has naturalWidth)
  const sourceWidth = (video as HTMLVideoElement).videoWidth || (video as HTMLImageElement).naturalWidth;
  const sourceHeight = (video as HTMLVideoElement).videoHeight || (video as HTMLImageElement).naturalHeight;

  if (!sourceWidth) return ''; // Not loaded yet

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;

  if (sourceRatio > targetRatio) {
    sHeight = sourceHeight;
    sWidth = sHeight * targetRatio;
    sx = (sourceWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = sourceWidth;
    sHeight = sWidth / targetRatio;
    sx = 0;
    sy = (sourceHeight - sHeight) / 2;
  }

  // Draw original (cropped)
  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Apply Grayscale and Simple Thresholding to simulate binary patterns
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    // Simulate LBP "texture" by thresholding against a mid-value 
    // This creates a dotty/binary look similar to visualized LBP
    const threshold = 100; 
    const val = avg > threshold ? 180 : 30; // Dark grey vs Light grey

    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    // Alpha remains same
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
};

export const captureOriginal = (
  video: HTMLVideoElement, 
  width: number, 
  height: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Crop Logic (Object-Cover behavior)
  const videoRatio = video.videoWidth / video.videoHeight;
  const targetRatio = width / height;
  let sx, sy, sWidth, sHeight;

  if (videoRatio > targetRatio) {
    sHeight = video.videoHeight;
    sWidth = sHeight * targetRatio;
    sx = (video.videoWidth - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = video.videoWidth;
    sHeight = sWidth / targetRatio;
    sx = 0;
    sy = (video.videoHeight - sHeight) / 2;
  }

  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Calculates a simplified histogram from a base64 image string.
 * This is async because it needs to load the image first.
 */
export const calculateHistogramData = (base64Str: string): Promise<{bin: number, value: number}[]> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 100; // Small internal res is fine for histogram
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve([]); return; }
            
            ctx.drawImage(img, 0, 0, 100, 100);
            const imageData = ctx.getImageData(0, 0, 100, 100).data;
            const bins = new Array(20).fill(0); // 20 bins for the chart
            
            for (let i = 0; i < imageData.length; i += 4) {
                const avg = (imageData[i] + imageData[i+1] + imageData[i+2]) / 3;
                const binIndex = Math.floor(avg / 255 * 19);
                bins[binIndex]++;
            }
            
            // Normalize slightly for better visuals
            const max = Math.max(...bins);
            const chartData = bins.map((val, idx) => ({
                bin: idx,
                value: (val / max) * 100
            }));
            resolve(chartData);
        };
        img.onerror = () => resolve([]);
    });
};