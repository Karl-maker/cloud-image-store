import { Content } from "../../../domain/entities/content";
import { UploadServiceInput, UploadServiceResponse } from "../../../domain/types/upload.service.type";

export default interface ITemporaryLinkService {
    generate: (
        key: string
    ) => Promise<{
        url: string;
        expDate: Date;
    }>
}