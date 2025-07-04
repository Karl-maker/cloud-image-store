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
exports.downloadImageWithMetadata = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Downloads an image from a URL and returns it as a Buffer with metadata.
 * @param imageUrl - The URL of the image.
 * @returns A Promise resolving to an object containing the Buffer, size, and MIME type.
 */
const downloadImageWithMetadata = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(imageUrl, {
            responseType: "arraybuffer", // Ensures we get raw binary data
        });
        const buffer = Buffer.from(response.data); // Convert arraybuffer to Buffer
        const size = buffer.length; // Get size in bytes
        const mimeType = response.headers["content-type"] || "application/octet-stream"; // Extract MIME type
        return { buffer, size, mimeType };
    }
    catch (error) {
        console.error("Error downloading image:", error);
        throw error;
    }
});
exports.downloadImageWithMetadata = downloadImageWithMetadata;
