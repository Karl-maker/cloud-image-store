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
exports.AWSObjectRemover = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
class AWSObjectRemover {
    constructor(s3Client, bucketName) {
        this.s3 = s3Client;
        this.bucketName = bucketName;
    }
    /**
     * Removes an object from the specified S3 bucket.
     * @param key - The key (path) of the object to remove.
     * @returns A promise that resolves when the object is removed.
     */
    removeObject(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                yield this.s3.send(command);
                console.log(`Object with key "${key}" has been deleted from bucket "${this.bucketName}".`);
            }
            catch (error) {
                console.error(`Error deleting object with key "${key}":`, error);
                throw new Error(`Failed to delete object from S3: ${error.message}`);
            }
        });
    }
}
exports.AWSObjectRemover = AWSObjectRemover;
