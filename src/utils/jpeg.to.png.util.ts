import sharp from 'sharp';

/**
 * Converts a JPEG Blob (Buffer) to a PNG Blob.
 * @param inputBlob - The JPEG image Blob (Buffer).
 * @returns A Promise that resolves to the PNG image Blob.
 */
export const convertJpegToPngBlob = async (inputBlob: Buffer): Promise<Blob> => {
  try {
    const outputBuffer = await sharp(inputBlob)
      .png() // Convert to PNG format
      .toBuffer(); // Returns the image as a Buffer (Blob in memory)
    
    // Create a Blob from the outputBuffer and specify the MIME type
    const outputBlob = new Blob([outputBuffer], { type: 'image/png' });

    return outputBlob;
  } catch (error) {
    console.error('Error converting JPEG Blob to PNG Blob:', error);
    throw error;
  }
};
