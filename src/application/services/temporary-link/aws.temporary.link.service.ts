import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ITemporaryLinkService from "./i.temporary.link.service";

export default class S3TemporaryLinkService implements ITemporaryLinkService {
    private s3Client: S3Client;
    private bucketName: string;
    private linkExpirationSeconds: number;

    constructor(bucketName: string, s3Config: S3ClientConfig, expirationSeconds = 3600) {
        this.bucketName = bucketName;
        this.linkExpirationSeconds = expirationSeconds;
        this.s3Client = new S3Client(s3Config);
    }

    async generate(key: string): Promise<{ url: string; expDate: Date }> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: this.linkExpirationSeconds,
        });

        const expDate = new Date(Date.now() + this.linkExpirationSeconds * 1000);

        return { url, expDate };
    }
}