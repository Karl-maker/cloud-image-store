import { S3Client, PutObjectCommand, PutObjectCommandInput, S3ClientConfig } from "@aws-sdk/client-s3";
import IUploadService from './i.upload.service';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fsPromises } from 'fs';
import { extname } from 'path';
import { UploadServiceInput, UploadServiceResponse } from "../../../domain/types/upload.service.type";

export default class S3UploadService implements IUploadService {
    private s3: S3Client;
    private bucketName: string;

    constructor(s3Config: S3ClientConfig, bucketName: string) {
        this.s3 = new S3Client(s3Config);
        this.bucketName = bucketName;
    }

    async upload(input: UploadServiceInput, cd: (err: Error | null, data?: UploadServiceResponse) => void): Promise<void> {
        const { fileBuffer, fileName, mimeType, metadata } = input;
        let length: number | undefined;

        // Ensure the MIME type is a video
        if (mimeType.startsWith('video/')) {
            length = await this.getVideoLength(fileBuffer, mimeType);
        }

        // Define parameters for the S3 upload
        const params: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
            Metadata: metadata,
        };

        try {
            const command = new PutObjectCommand(params);
            const uploadResult = await this.s3.send(command);

            // Create the response object
            const response: UploadServiceResponse = {
                key: fileName,
                src: `https://${this.bucketName}.s3.amazonaws.com/${fileName}`,
                mimeType: mimeType,
                fileSize: fileBuffer.length, // Include file size
                length, // Include length if calculated
            };

            // Call the callback with the response data
            cd(null, response);
        } catch (error) {
            // Handle error and call callback with the error
            cd(error as Error);
        }
    }

    // Helper method to get video length using fluent-ffmpeg
    private async getVideoLength(fileBuffer: Buffer, mimeType: string): Promise<number | undefined> {
        return new Promise<number | undefined>((resolve, reject) => {
            // Generate a temporary file path
            const tempFilePath = `temp_video${extname(mimeType)}`;

            // Write the buffer to a temporary file
            fsPromises.writeFile(tempFilePath, fileBuffer)
                .then(() => {
                    // Use ffmpeg to get video metadata
                    ffmpeg(tempFilePath)
                        .ffprobe((err, data) => {
                            // Remove the temporary file after processing
                            fsPromises.unlink(tempFilePath)
                                .catch(unlinkErr => {
                                    console.error('Error removing temporary file:', unlinkErr);
                                });

                            if (err) {
                                return reject(err);
                            }

                            // Extract duration from the metadata
                            const duration: number | undefined = data.format.duration;
                            resolve(duration);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}