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
import { SpaceUsecase } from "./space.usecase";
import { InsufficentStorageException } from "../../application/exceptions/insufficent.storage.exception";
import { bytesToMB } from "../../utils/bytes.to.mb";
import { BUCKET_NAME_PRIVATE } from "../constants/bucket.name";
import { CreateContentVariantDTO } from "../interfaces/presenters/dtos/create.content.variant.dto";
import { NotFoundException } from "../../application/exceptions/not.found";
import { IImageVariant } from "../../application/services/ai/interface.image.variant";
import { GetBlobService } from "../../application/blob/interface.get.blob.service";
import { convertJpegToPngBlob } from "../../utils/jpeg.to.png.util";
import { blobToBuffer } from "../../utils/blob.to.buffer.util";
import { compressBlobToSize } from "../../utils/compless.blob.util";
import { isImageSizeLessThanTargetInBytes } from "../../utils/check.size.util";

export class ContentUsecase extends Usecases<Content, ContentSortBy, ContentFilterBy, ContentRepository> {
    constructor (
        repository: ContentRepository,
        private uploadService: IUploadService,
        private spaceUsecase: SpaceUsecase,
        private imageVariantService: IImageVariant,
        private blobService: GetBlobService
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
            ai: data.ai ?? false,
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
            const spaceId = data.spaceId;
            let content : Content = {
                name: item.originalname,
                description: null,
                key: "",
                mimeType: "",
                location: "",
                uploadCompletion: 0,
                spaceId: data.spaceId,
                id: null,
                createdAt: new Date(),
                updatedAt:  new Date(),
                size: bytesToMB(item.size)
            }
            if(!await this.spaceUsecase.hasMemory(data.spaceId, item.size)) throw new InsufficentStorageException('out of memory in space')
            
            await this.uploadService.upload({
                fileBuffer: item.buffer,
                fileName: BUCKET_NAME_PRIVATE + '/' + name,
                mimeType: item.mimetype,
            }, 
            async (err: Error | null, data?: UploadServiceResponse) => {
                if(err) content.uploadError = 'Issue Uploading Content';
                if(data) {
                    content.key = data.key;
                    content.location = data.src;
                    content.mimeType = data.mimeType;
                    content.size = bytesToMB(item.size);
                    content.height = data.height;
                    content.width = data.width;
                    content = await this.repository.save(content);
                    await this.spaceUsecase.addMemory(spaceId, bytesToMB(item.size));
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

    async generateContentVariant(data: CreateContentVariantDTO): Promise<void> {
        const content = await this.repository.findById(data.contentId);
        if(!content) throw new NotFoundException('content not found');
        let pngBlob : Blob | undefined;
        const blob = await this.blobService.getBlob(content.key);

        // if(content.mimeType === 'image/jpeg') pngBlob = await convertJpegToPngBlob(await blobToBuffer(blob))
        // if(content.mimeType === 'image/png') pngBlob = blob
        // if(!pngBlob) throw new Error('cannot convert to png');

        // const compressed = isImageSizeLessThanTargetInBytes(pngBlob.size, 4 * 1024 * 1024) ? pngBlob : await compressBlobToSize(await blobToBuffer(pngBlob), 3.5);
        const results = await this.imageVariantService.generate(blob, data.prompt, 1, content.spaceId);
        await Promise.all(results.map(async (content) => {
            await this.repository.save(content);
        }))
    }
    
}