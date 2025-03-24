/**
 * Checks if the size of the image (in bytes) is less than the target size in bytes.
 * @param imageSizeBytes - The size of the image in bytes.
 * @param targetSizeBytes - The target file size in bytes.
 * @returns True if the image size is less than or equal to the target size, false otherwise.
 */
export const isImageSizeLessThanTargetInBytes = (imageSizeBytes: number, targetSizeBytes: number): boolean => {
    return imageSizeBytes <= targetSizeBytes;
  };
  