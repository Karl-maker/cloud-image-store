import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { Readable } from "stream";
import IMp4ToHlsService from "./i.mp4.to.hls.service";
import { generateUuid } from "../../../utils/generate.uuid.util";
import { ObjectDataType } from "../../../domain/types/object.data.type";
const execPromise = promisify(exec);

class Mp4ToHlsService implements IMp4ToHlsService {
    constructor(
        private bucketName: string,
        private bucketHlsLocation: string, // where in s3 to upload the hls files
        private s3Client: S3Client
    ) {}

    /**
     * @desc gets mp4 video from s3, converts it to HLS for streaming then upload the HLS to the same bucket with path provided
     * @param mp4Key AWS key of item
     * @param cb 
     */
    async convert(mp4Key: string, cb: (err: null | Error, data?: ObjectDataType) => Promise<void>): Promise<void> {
        const tempDir = path.join(__dirname, "temp");

        try {
            // Ensure the temp directory exists
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            const uuid = generateUuid();
            const mp4FilePath = path.join(tempDir, uuid + "-input.mp4");
            const hlsOutputPath = path.join(tempDir, uuid + "-hls");
            
            fs.mkdirSync(hlsOutputPath, { recursive: true });

            await this.downloadFileFromS3(mp4Key, mp4FilePath);

            await this.convertMp4ToHls(mp4FilePath, hlsOutputPath);

            const hlsKey = `${this.bucketHlsLocation}/${path.basename(mp4Key, ".mp4")}`;
            await this.uploadHlsToS3(hlsOutputPath, hlsKey);

            this.cleanup(tempDir);
            await cb(null, {
                src: `https://${this.bucketName}.s3.amazonaws.com/${hlsKey}/master.m3u8`,
                key: hlsKey,
                mimeType: "application/x-mpegURL",
                fileSize: "N/A", // HLS files are segmented
            });

        } catch (err) {
            await cb(err as Error);
            this.cleanup(tempDir);
        } finally {
            // Clean up the temp directory after processing
            this.cleanup(tempDir);
        }
    }

    private async downloadFileFromS3(mp4Key: string, destinationPath: string): Promise<void> {
        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: mp4Key });
        const { Body } = await this.s3Client.send(command);
        
        if (!(Body instanceof Readable)) {
            throw new Error("Invalid response body from S3");
        }

        return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(destinationPath);
            Body.pipe(fileStream)
                .on("finish", resolve)
                .on("error", reject);
        });
    }

    private async convertMp4ToHls(inputPath: string, outputPath: string): Promise<void> {
        const hlsFilePath = path.join(outputPath, "master.m3u8");

        const ffmpegCmd = `ffmpeg -i ${inputPath} -profile:v baseline -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${hlsFilePath}`;
        await execPromise(ffmpegCmd);
    }

    private async uploadHlsToS3(folderPath: string, s3KeyPrefix: string): Promise<void> {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStream = fs.createReadStream(filePath);
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: `${s3KeyPrefix}/${file}`,
                Body: fileStream,
                ContentType: file.endsWith(".m3u8") ? "application/x-mpegURL" : "video/MP2T",
            });
            await this.s3Client.send(command);
        }
    }
    private cleanup(directory: string): void {
        try {
            fs.rmSync(directory, { recursive: true, force: true });
        } catch (err) {
        }
    }
    
}

export default Mp4ToHlsService;
