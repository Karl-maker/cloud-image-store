"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const client_s3_1 = require("@aws-sdk/client-s3");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const stream_1 = require("stream");
const generate_uuid_util_1 = require("../../../utils/generate.uuid.util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
class Mp4ToHlsService {
    constructor(bucketName, bucketHlsLocation, // where in s3 to upload the hls files
    s3Client) {
        this.bucketName = bucketName;
        this.bucketHlsLocation = bucketHlsLocation;
        this.s3Client = s3Client;
    }
    /**
     * @desc gets mp4 video from s3, converts it to HLS for streaming then upload the HLS to the same bucket with path provided
     * @param mp4Key AWS key of item
     * @param cb
     */
    convert(mp4Key, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempDir = path.join(__dirname, "temp");
            try {
                // Ensure the temp directory exists
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }
                const uuid = (0, generate_uuid_util_1.generateUuid)();
                const mp4FilePath = path.join(tempDir, uuid + "-input.mp4");
                const hlsOutputPath = path.join(tempDir, uuid + "-hls");
                fs.mkdirSync(hlsOutputPath, { recursive: true });
                yield this.downloadFileFromS3(mp4Key, mp4FilePath);
                yield this.convertMp4ToHls(mp4FilePath, hlsOutputPath);
                const hlsKey = `${this.bucketHlsLocation}/${path.basename(mp4Key, ".mp4")}`;
                yield this.uploadHlsToS3(hlsOutputPath, hlsKey);
                this.cleanup(tempDir);
                yield cb(null, {
                    src: `https://${this.bucketName}.s3.amazonaws.com/${hlsKey}/master.m3u8`,
                    key: hlsKey,
                    mimeType: "application/x-mpegURL",
                    fileSize: "N/A", // HLS files are segmented
                });
            }
            catch (err) {
                yield cb(err);
                this.cleanup(tempDir);
            }
            finally {
                // Clean up the temp directory after processing
                this.cleanup(tempDir);
            }
        });
    }
    downloadFileFromS3(mp4Key, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucketName, Key: mp4Key });
            const { Body } = yield this.s3Client.send(command);
            if (!(Body instanceof stream_1.Readable)) {
                throw new Error("Invalid response body from S3");
            }
            return new Promise((resolve, reject) => {
                const fileStream = fs.createWriteStream(destinationPath);
                Body.pipe(fileStream)
                    .on("finish", resolve)
                    .on("error", reject);
            });
        });
    }
    convertMp4ToHls(inputPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const hlsFilePath = path.join(outputPath, "master.m3u8");
            const ffmpegCmd = `ffmpeg -i ${inputPath} -profile:v baseline -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${hlsFilePath}`;
            yield execPromise(ffmpegCmd);
        });
    }
    uploadHlsToS3(folderPath, s3KeyPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const fileStream = fs.createReadStream(filePath);
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: `${s3KeyPrefix}/${file}`,
                    Body: fileStream,
                    ContentType: file.endsWith(".m3u8") ? "application/x-mpegURL" : "video/MP2T",
                });
                yield this.s3Client.send(command);
            }
        });
    }
    cleanup(directory) {
        try {
            fs.rmSync(directory, { recursive: true, force: true });
        }
        catch (err) {
        }
    }
}
exports.default = Mp4ToHlsService;
