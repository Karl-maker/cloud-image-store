import { Usecases } from "./usecases";
import { Content } from "../entities/content";
import { ContentFilterBy, ContentSortBy } from "../types/content";
import { ContentRepository } from "../repositories/content.repository";
import { CreateContentDTO } from "../interfaces/presenters/dtos/create.content.dto";
import { UpdateContentDTO } from "../interfaces/presenters/dtos/update.content.dto";
import IUploadService from "../../application/services/upload/i.upload.service";
import { UploadContentDTO } from "../interfaces/presenters/dtos/upload.content.dto";
import { UploadServiceResponse } from "../types/upload.service.type";
import { generateUuid } from "../../utils/generate.uuid.util";

export class ContentUsecase extends Usecases<Content, ContentSortBy, ContentFilterBy, ContentRepository> {
    constructor (
        repository: ContentRepository,
        private uploadService: IUploadService
    ) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateContentDTO): Promise<Content> {

        const content : Content = {
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: data.name,
            description: data.description,
            key: data.key,
            mimeType: data.mimeType,
            location: data.location,
            uploadCompletion: 0,
            spaceId: data.spaceId,
            size: 0
        }

        return content;
    }
    async mapUpdateDtoToEntity(data: UpdateContentDTO, item: Content): Promise<Content> {

        const content : Content = {
            ...item,
            ...data
        }

        return content;
    }

    async upload(data: UploadContentDTO): Promise<void> {
        for (const item of data.files) {
            const name = generateUuid();
            let content : Content = {
                name: name,
                description: null,
                key: "",
                mimeType: "",
                location: "",
                uploadCompletion: 0,
                spaceId: data.spaceId,
                id: null,
                createdAt: new Date(),
                updatedAt:  new Date(),
                size: 0
            }
            
            await this.uploadService.upload({
                fileBuffer: item.buffer,
                fileName: name,
                mimeType: item.mimetype,
            }, 
            async (err: Error | null, data?: UploadServiceResponse) => {
                if(err) content.uploadError = 'Issue Uploading Content';
                if(data) {
                    content.key = data.key;
                    content.location = data.src;
                    content.mimeType = data.mimeType;
                    content.size = item.size;
                    
                    content = await this.repository.save(content)
                }
            }, 
            async (precentage?: number) => {
                if(precentage && content.id) {
                    content.uploadCompletion = precentage;
                    await this.repository.save(content)
                }

            })
        }
    }
    
}