import { S3Client, PutObjectCommandInput, S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import IUploadService from "./i.upload.service";
import ffmpeg from "fluent-ffmpeg";
import sharp from "sharp";
import { promises as fsPromises } from "fs";
import { extname } from "path";
import { UploadServiceInput, UploadServiceResponse } from "../../../domain/types/upload.service.type";

export default class S3UploadService implements IUploadService {
    private s3: S3Client;
    private bucketName: string;

    constructor(private s3Config: S3ClientConfig, bucketName: string) {
        this.s3 = new S3Client(s3Config);
        this.bucketName = bucketName;
    }

    async upload(
        input: UploadServiceInput,
        cd: (err: Error | null, data?: UploadServiceResponse) => Promise<void>,
        load?: (percentage?: number) => Promise<void>
    ): Promise<void> {
        const { fileBuffer, fileName, mimeType, metadata } = input;
        let length: number | undefined;
        let width: number | undefined;
        let height: number | undefined;

        if (mimeType.startsWith("video/")) {
            length = await this.getVideoLength(fileBuffer, mimeType);
        } else if (mimeType.startsWith("image/")) {
            ({ width, height } = await this.getImageDimensions(fileBuffer));
        }

        const params: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
            Metadata: metadata,
            CacheControl: 'max-age=86400'
        };

        try {
            const parallelUploads3 = new Upload({
                client: this.s3,
                params,
            });

            parallelUploads3.on("httpUploadProgress", async (progress) => {
                if (load) {
                    const percentage = Math.round((progress.loaded! / progress.total!) * 100);
                    await load(percentage);
                }
            });

            await parallelUploads3.done();

            const response: UploadServiceResponse = {
                key: fileName,
                src: `https://${this.bucketName}.s3.amazonaws.com/${fileName}`,
                mimeType,
                fileSize: fileBuffer.length,
                length,
                width,
                height,
                downloadUrl: `https://${this.bucketName}.s3.${this.s3Config.region}.amazonaws.com/${fileName}`
            };

            await cd(null, response);
        } catch (error) {
            await cd(error as Error);
        }
    }

    private async getVideoLength(fileBuffer: Buffer, mimeType: string): Promise<number | undefined> {
        return new Promise<number | undefined>((resolve, reject) => {
            const tempFilePath = `temp_video${extname(mimeType)}`;
            fsPromises.writeFile(tempFilePath, fileBuffer)
                .then(() => {
                    ffmpeg(tempFilePath).ffprobe((err, data) => {
                        fsPromises.unlink(tempFilePath).catch(console.error);
                        if (err) return reject(err);
                        resolve(data.format.duration);
                    });
                })
                .catch(reject);
        });
    }

    private async getImageDimensions(fileBuffer: Buffer): Promise<{ width: number; height: number }> {
        try {
            const metadata = await sharp(fileBuffer).metadata();
            return { width: metadata.width ?? 0, height: metadata.height ?? 0 };
        } catch (error) {
            console.error("Error getting image dimensions:", error);
            return { width: 0, height: 0 };
        }
    }
}
