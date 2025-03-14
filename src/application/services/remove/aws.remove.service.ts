import { S3, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ObjectRemover } from './i.remove.service';

export class AWSObjectRemover implements ObjectRemover {
    private s3: S3;
    private bucketName: string;

    constructor(s3Client: S3, bucketName: string) {
        this.s3 = s3Client;
        this.bucketName = bucketName;
    }

    /**
     * Removes an object from the specified S3 bucket.
     * @param key - The key (path) of the object to remove.
     * @returns A promise that resolves when the object is removed.
     */
    async removeObject(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3.send(command);
            console.log(`Object with key "${key}" has been deleted from bucket "${this.bucketName}".`);
        } catch (error) {
            console.error(`Error deleting object with key "${key}":`, error);
            throw new Error(`Failed to delete object from S3: ${(error as any).message}`);
        }
    }
}
