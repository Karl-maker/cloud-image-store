import { UploadServiceInput, UploadServiceResponse } from "../../../domain/types/upload.service.type";

export default interface IUploadService {
    upload: (
        input: UploadServiceInput, 
        cd: (err: Error | null, data?: UploadServiceResponse) => Promise<void>, 
        load?: (precentage?: number) => Promise<void>
    ) => Promise<void>
}