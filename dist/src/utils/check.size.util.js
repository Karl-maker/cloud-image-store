"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImageSizeLessThanTargetInBytes = void 0;
/**
 * Checks if the size of the image (in bytes) is less than the target size in bytes.
 * @param imageSizeBytes - The size of the image in bytes.
 * @param targetSizeBytes - The target file size in bytes.
 * @returns True if the image size is less than or equal to the target size, false otherwise.
 */
const isImageSizeLessThanTargetInBytes = (imageSizeBytes, targetSizeBytes) => {
    return imageSizeBytes <= targetSizeBytes;
};
exports.isImageSizeLessThanTargetInBytes = isImageSizeLessThanTargetInBytes;
