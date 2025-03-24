import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { GetBlobService } from "./interface.get.blob.service";

export class S3GetBlobService implements GetBlobService {
    private s3Client : S3Client;
    
    constructor(s3Config: S3ClientConfig, private bucketName: string) {
        this.s3Client = new S3Client(s3Config);
    }

    async getBlob(key: string): Promise<Blob> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error("S3 response body is empty");
            }

            // Convert stream to buffer
            const streamToBuffer = async (stream: any): Promise<Buffer> => {
                const chunks: Buffer[] = [];
                for await (const chunk of stream) {
                    chunks.push(Buffer.from(chunk));
                }
                return Buffer.concat(chunks);
            };

            const buffer = await streamToBuffer(response.Body);
            return new Blob([buffer], { type: response.ContentType || "application/octet-stream" });
        } catch (error) {
            console.error("Error fetching Blob from S3:", error);
            throw error;
        }
    }
}
