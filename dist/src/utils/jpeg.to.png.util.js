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
exports.convertJpegToPngBlob = void 0;
const sharp_1 = __importDefault(require("sharp"));
/**
 * Converts a JPEG Blob (Buffer) to a PNG Blob.
 * @param inputBlob - The JPEG image Blob (Buffer).
 * @returns A Promise that resolves to the PNG image Blob.
 */
const convertJpegToPngBlob = (inputBlob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outputBuffer = yield (0, sharp_1.default)(inputBlob)
            .png() // Convert to PNG format
            .toBuffer(); // Returns the image as a Buffer (Blob in memory)
        // Create a Blob from the outputBuffer and specify the MIME type
        const outputBlob = new Blob([outputBuffer], { type: 'image/png' });
        return outputBlob;
    }
    catch (error) {
        console.error('Error converting JPEG Blob to PNG Blob:', error);
        throw error;
    }
});
exports.convertJpegToPngBlob = convertJpegToPngBlob;
