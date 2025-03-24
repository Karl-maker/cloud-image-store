/**
 * Converts a Blob (or Blob-like object) to a Buffer in Node.js.
 * @param blob - The Blob object (or Blob-like object) to convert.
 * @returns A Promise that resolves to a Buffer.
 */
export function blobToBuffer(blob: Blob): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // For server-side Node.js, directly convert the Blob (or Blob-like object) to a Buffer
      if (blob instanceof Blob) {
        const chunks: Buffer[] = [];
  
        // Read the Blob as a stream (if it's a stream-like object)
        const reader = blob.stream().getReader();
  
        // Read the chunks and concatenate them into a Buffer
        const readStream = async () => {
          try {
            const { done, value } = await reader.read();
            if (done) {
              // If done, concatenate chunks and resolve the Buffer
              resolve(Buffer.concat(chunks));
            } else {
              // Otherwise, push the chunk to the array
              chunks.push(Buffer.from(value));
              readStream();
            }
          } catch (error) {
            reject(new Error("Error reading Blob stream"));
          }
        };
        
        readStream();
      } else {
        reject(new Error("Provided input is not a valid Blob object"));
      }
    });
  }
  