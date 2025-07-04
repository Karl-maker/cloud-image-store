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
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const path_1 = require("path");
class S3UploadService {
    constructor(s3Config, bucketName) {
        this.s3Config = s3Config;
        this.s3 = new client_s3_1.S3Client(s3Config);
        this.bucketName = bucketName;
    }
    upload(input, cd, load) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fileBuffer, fileName, mimeType, metadata } = input;
            let length;
            let width;
            let height;
            if (mimeType.startsWith("video/")) {
                length = yield this.getVideoLength(fileBuffer, mimeType);
            }
            else if (mimeType.startsWith("image/")) {
                ({ width, height } = yield this.getImageDimensions(fileBuffer));
            }
            const params = {
                Bucket: this.bucketName,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                Metadata: metadata,
                CacheControl: 'max-age=86400'
            };
            try {
                const parallelUploads3 = new lib_storage_1.Upload({
                    client: this.s3,
                    params,
                });
                parallelUploads3.on("httpUploadProgress", (progress) => __awaiter(this, void 0, void 0, function* () {
                    if (load) {
                        const percentage = Math.round((progress.loaded / progress.total) * 100);
                        yield load(percentage);
                    }
                }));
                yield parallelUploads3.done();
                const response = {
                    key: fileName,
                    src: `https://${this.bucketName}.s3.amazonaws.com/${fileName}`,
                    mimeType,
                    fileSize: fileBuffer.length,
                    length,
                    width,
                    height,
                    downloadUrl: `https://${this.bucketName}.s3.${this.s3Config.region}.amazonaws.com/${fileName}`
                };
                yield cd(null, response);
            }
            catch (error) {
                yield cd(error);
            }
        });
    }
    getVideoLength(fileBuffer, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const tempFilePath = `temp_video${(0, path_1.extname)(mimeType)}`;
                fs_1.promises.writeFile(tempFilePath, fileBuffer)
                    .then(() => {
                    (0, fluent_ffmpeg_1.default)(tempFilePath).ffprobe((err, data) => {
                        fs_1.promises.unlink(tempFilePath).catch(console.error);
                        if (err)
                            return reject(err);
                        resolve(data.format.duration);
                    });
                })
                    .catch(reject);
            });
        });
    }
    getImageDimensions(fileBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const metadata = yield (0, sharp_1.default)(fileBuffer).metadata();
                return { width: (_a = metadata.width) !== null && _a !== void 0 ? _a : 0, height: (_b = metadata.height) !== null && _b !== void 0 ? _b : 0 };
            }
            catch (error) {
                console.error("Error getting image dimensions:", error);
                return { width: 0, height: 0 };
            }
        });
    }
}
exports.default = S3UploadService;
