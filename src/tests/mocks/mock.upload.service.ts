import IUploadService from "../../application/services/upload/i.upload.service";
import { UploadServiceInput, UploadServiceResponse } from "../../domain/types/upload.service.type";

export class MockUploadService implements IUploadService {
    async upload(
        input: UploadServiceInput,
        cd: (err: Error | null, data?: UploadServiceResponse) => Promise<void>,
        load?: (percentage?: number) => Promise<void>
    ): Promise<void> {
        try {
            // Simulate upload progress
            if (load) {
                await load(50);
                await load(100);
            }

            const response: UploadServiceResponse = {
                key: input.fileName,
                src: `https://mock-s3.example.com/${input.fileName}`,
                mimeType: input.mimeType,
                fileSize: input.fileBuffer.length,
                length: undefined,
                width: 1920,
                height: 1080,
                downloadUrl: `https://mock-s3.example.com/download/${input.fileName}`
            };

            await cd(null, response);
        } catch (error) {
            await cd(error as Error);
        }
    }
} 