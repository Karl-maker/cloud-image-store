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
Object.defineProperty(exports, "__esModule", { value: true });
exports.blobToBuffer = blobToBuffer;
/**
 * Converts a Blob (or Blob-like object) to a Buffer in Node.js.
 * @param blob - The Blob object (or Blob-like object) to convert.
 * @returns A Promise that resolves to a Buffer.
 */
function blobToBuffer(blob) {
    return new Promise((resolve, reject) => {
        // For server-side Node.js, directly convert the Blob (or Blob-like object) to a Buffer
        if (blob instanceof Blob) {
            const chunks = [];
            // Read the Blob as a stream (if it's a stream-like object)
            const reader = blob.stream().getReader();
            // Read the chunks and concatenate them into a Buffer
            const readStream = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { done, value } = yield reader.read();
                    if (done) {
                        // If done, concatenate chunks and resolve the Buffer
                        resolve(Buffer.concat(chunks));
                    }
                    else {
                        // Otherwise, push the chunk to the array
                        chunks.push(Buffer.from(value));
                        readStream();
                    }
                }
                catch (error) {
                    reject(new Error("Error reading Blob stream"));
                }
            });
            readStream();
        }
        else {
            reject(new Error("Provided input is not a valid Blob object"));
        }
    });
}
