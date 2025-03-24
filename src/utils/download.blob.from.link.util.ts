import axios from "axios";

/**
 * Downloads an image from a URL and returns it as a Buffer with metadata.
 * @param imageUrl - The URL of the image.
 * @returns A Promise resolving to an object containing the Buffer, size, and MIME type.
 */
export const downloadImageWithMetadata = async (imageUrl: string): Promise<{ buffer: Buffer; size: number; mimeType: string }> => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer", // Ensures we get raw binary data
        });

        const buffer = Buffer.from(response.data); // Convert arraybuffer to Buffer
        const size = buffer.length; // Get size in bytes
        const mimeType = response.headers["content-type"] || "application/octet-stream"; // Extract MIME type

        return { buffer, size, mimeType };
    } catch (error) {
        console.error("Error downloading image:", error);
        throw error;
    }
};
