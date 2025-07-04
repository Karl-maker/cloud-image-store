"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressBlobToSize = void 0;
const sharp_1 = __importDefault(require("sharp"));
/**
 * Compresses an image Blob to a target size in MB.
 * @param inputBlob - The image Blob to compress.
 * @param targetSizeMB - The target file size in megabytes (MB).
 * @returns A Promise that resolves to the compressed image Blob.
 */
const compressBlobToSize = (inputBlob, targetSizeMB) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Set the initial compression parameters
        let quality = 80; // Default quality for compression (0-100 range)
        let compressedBuffer;
        let targetSizeBytes = targetSizeMB * 1024 * 1024; // Convert MB to bytes
        // Resize parameters to progressively scale the image
        let width = 1000; // Initial width, adjust as needed based on image resolution
        let height = 1000; // Initial height, adjust as needed based on image resolution
        // Use a loop to gradually reduce the quality and check the file size
        while (true) {
            // Compress image with current quality and resizing
            compressedBuffer = yield (0, sharp_1.default)(inputBlob)
                .resize(width, height, { fit: 'inside' }) // Resize image to fit within target dimensions
                .png({ quality }) // Adjust the format and quality
                .toBuffer();
            // If the size is less than or equal to the target size, break out
            if (compressedBuffer.length <= targetSizeBytes) {
                break;
            }
            // Reduce the dimensions progressively
            width = Math.floor(width * 0.9); // Reduce width by 10% each time
            height = Math.floor(height * 0.9); // Reduce height by 10% each time
            // If dimensions become too small or quality drops too low, break out
            if (width < 100 || height < 100 || quality <= 10) {
                break;
            }
            // Reduce quality by 5 (you can adjust the reduction step)
            quality -= 5;
        }
        // Create a Blob from the compressed image buffer (Note: Blob is not typically used in Node.js, so this is just for API consistency)
        const outputBlob = new Blob([compressedBuffer], { type: 'image/png' });
        return outputBlob;
    }
    catch (error) {
        console.error('Error compressing Blob to size:', error);
        throw error;
    }
});
exports.compressBlobToSize = compressBlobToSize;
