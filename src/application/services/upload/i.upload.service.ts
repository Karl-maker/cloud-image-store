import { UploadServiceInput, UploadServiceResponse } from "../../../domain/types/upload.service.type";

export default interface IUploadService {
    upload: (
        input: UploadServiceInput, 
        cd: (err: Error | null, data?: UploadServiceResponse) => void, 
        load?: (precentage?: number) => void
    ) => Promise<void>
}