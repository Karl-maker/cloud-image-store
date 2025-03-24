import sharp from 'sharp';

/**
 * Compresses an image Blob to a target size in MB.
 * @param inputBlob - The image Blob to compress.
 * @param targetSizeMB - The target file size in megabytes (MB).
 * @returns A Promise that resolves to the compressed image Blob.
 */
export const compressBlobToSize = async (inputBlob: Buffer, targetSizeMB: number): Promise<Blob> => {
  try {
    // Set initial quality or compression parameters for sharp
    let quality = 80;  // Default quality for compression (0-100 range)
    let compressedBuffer: Buffer;
    let targetSizeBytes = targetSizeMB * 1024 * 1024; // Convert MB to bytes

    // Use a loop to gradually reduce the quality and check the file size
    while (true) {
      // Compress image to buffer with the current quality
      compressedBuffer = await sharp(inputBlob)
        .png({ quality }) // You can adjust the format as needed
        .toBuffer();

      // If the size is less than or equal to the target size, break out
      if (compressedBuffer.length <= targetSizeBytes) {
        break;
      }

      // Reduce quality by 5 (you can adjust the reduction step)
      quality -= 5;

      // If quality goes below a threshold, stop compressing to avoid too much quality loss
      if (quality <= 10) {
        break;
      }
    }

    // Create a Blob from the compressed image buffer (Note: Blob is not typically used in Node.js, so this is just for API consistency)
    const outputBlob = new Blob([compressedBuffer], { type: 'image/jpeg' });

    return outputBlob;
  } catch (error) {
    console.error('Error compressing Blob to size:', error);
    throw error;
  }
};
