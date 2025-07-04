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
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3TemporaryLinkService {
    constructor(bucketName, s3Config, expirationSeconds = 3600) {
        this.bucketName = bucketName;
        this.linkExpirationSeconds = expirationSeconds;
        this.s3Client = new client_s3_1.S3Client(s3Config);
    }
    generate(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn: this.linkExpirationSeconds,
            });
            const expDate = new Date(Date.now() + this.linkExpirationSeconds * 1000);
            return { url, expDate };
        });
    }
}
exports.default = S3TemporaryLinkService;
