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
import { BUCKET_NAME_PRIVATE } from "../constants/bucket.name";
import { CreateContentVariantDTO } from "../interfaces/presenters/dtos/create.content.variant.dto";
import { NotFoundException } from "../../application/exceptions/not.found";
import { IImageVariant } from "../../application/services/ai/interface.image.variant";
import { GetBlobService } from "../../application/services/blob/interface.get.blob.service";
import { SpaceRepository } from "../repositories/space.repository";
import { downloadImageWithMetadata } from "../../utils/download.blob.from.link.util";
import { UserRepository } from "../repositories/user.repository";
import { FindManyDTO } from "../interfaces/presenters/dtos/find.many.dto";
import { FindManyResponse } from "../types/usecase";
import { FindParams } from "../types/repository";
import { convertToFilters } from "../../utils/convert.params.to.filters.util";
import ITemporaryLinkService from "../../application/services/temporary-link/i.temporary.link.service";
import { GetObjectCommand, GetObjectCommandOutput, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpException } from "../../application/exceptions/http.exception";
import { UserUsecase } from "./user.usecase";
import { COMPANY_DOMAIN, EMAIL_NO_REPLY_USER, EMAIL_NO_REPLY_SERVICE, EMAIL_NO_REPLY_PASS } from "../../application/configuration";
import { SPACE_PATH } from "../constants/api.routes";
import { ContentUploadedEmailContent } from "../types/email";
import { ContentUploadedEmail } from "../entities/content.uploaded.email";
import { Templates } from "../constants/templates";
import { SendEmail } from "../../application/services/send-email/nodemailer.email.service";

export class ContentUsecase extends Usecases<Content, ContentSortBy, ContentFilterBy, ContentRepository> {
    constructor (
        repository: ContentRepository,
        private uploadService: IUploadService,
        public spaceUsecase: SpaceUsecase,
        private imageVariantService: IImageVariant,
        public blobService: GetBlobService,
        private temporaryLinkService: ITemporaryLinkService,
        private userUsecase: UserUsecase
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
    async redirectToS3(key: string, bucketName: string, s3Config: S3ClientConfig, rangeHeader?: string | undefined) : Promise<{
        stream: NodeJS.ReadableStream,
        data: GetObjectCommandOutput
    }> {
        try {
            const s3 = new S3Client(s3Config)
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key,
                Range: rangeHeader
            });
          
            const data = await s3.send(command);
            const stream = data.Body as NodeJS.ReadableStream;
            return {
                data,
                stream
            };
        } catch(err) {
            throw new HttpException('Unexpected Error', 'Issue generating temp url', 500)
        }
    }
    async upload(data: UploadContentDTO): Promise<void> {
        const lastUploadedContent = await this.repository.findMany({
            filters: {
                spaceId: {
                    exact: data.spaceId
                }
            },
        })

        let shouldSendEmail = true;

        // check if it was uploaded in the last hour if so, send email to user
        if(lastUploadedContent.data.length > 0) {
            const lst = lastUploadedContent.data[0];
            if(lst.createdAt > new Date(Date.now() - 1 * 60 * 60 * 1000)) {
                shouldSendEmail = false;
            }
        } 

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
                size: item.size
            }
            
            await this.uploadService.upload({
                fileBuffer: item.buffer,
                fileName: BUCKET_NAME_PRIVATE + '/' + data.spaceId + '/' + name,
                mimeType: item.mimetype,
            }, 

            async (err: Error | null, data?: UploadServiceResponse) => {
                if(err) content.uploadError = 'Issue Uploading Content';
                if(data) {
                    content.key = data.key;
                    content.location = data.src;
                    content.mimeType = data.mimeType;
                    content.size = item.size;
                    content.height = data.height;
                    content.downloadUrl = data.downloadUrl;
                    content.width = data.width;
                    content = await this.repository.save(content);
                    await this.spaceUsecase.addMemory(spaceId, item.size);
                }
            }, 
            async (precentage?: number) => {
                if(precentage && content.id) {
                    content.uploadCompletion = precentage;
                    await this.repository.save(content)
                }

            })
        
        }

        // send email to user

        if(!shouldSendEmail) return;

        const space = await this.spaceUsecase.findById(data.spaceId);

        if(!space) return;

        const user = await this.userUsecase.findById(space.createdByUserId);

        if(user) {
            const contentUploadedEmailContent : ContentUploadedEmailContent = {
                name: user.firstName + " " + user.lastName,
                spaceLink: `${COMPANY_DOMAIN}/album/${data.spaceId}`,
            }

            const email : ContentUploadedEmail = {
                template: Templates.CONTENT_UPLOADED,
                to: user.email,
                from: EMAIL_NO_REPLY_USER!,
                content: contentUploadedEmailContent,
                subject: `${space.name} - Media Uploaded`,
                id: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            await new SendEmail(
                EMAIL_NO_REPLY_SERVICE!,
                EMAIL_NO_REPLY_USER!,
                EMAIL_NO_REPLY_PASS!
            ).send(email);

            const otherUsers = space.userIds.filter((id) => id !== user.id);

            for(const otherUserId of otherUsers) {
                const otherUser = await this.userUsecase.findById(otherUserId);
                if(!otherUser) continue;

                email.to = otherUser.email;
                email.content.name = otherUser.firstName + " " + otherUser.lastName;

                await new SendEmail(
                    EMAIL_NO_REPLY_SERVICE!,
                    EMAIL_NO_REPLY_USER!,
                    EMAIL_NO_REPLY_PASS!
                ).send(email);
            }
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
            const img = await downloadImageWithMetadata(content.location)
            const name = generateUuid();
            await this.uploadService.upload({
                fileBuffer: img.buffer,
                fileName: BUCKET_NAME_PRIVATE + '/' + content.spaceId + '/' + name,
                mimeType: img.mimeType,
            }, 
            async (err: Error | null, data?: UploadServiceResponse) => {
                if(err) content.uploadError = 'Issue Uploading Content';
                if(data) {
                    content.key = data.key;
                    content.location = data.src;
                    content.mimeType = img.mimeType;
                    content.size = img.size;
                    content.height = data.height;
                    content.width = data.width;
                    content.downloadUrl = data.downloadUrl;
                    content = await this.repository.save(content);
                    await this.spaceUsecase.addMemory(content.spaceId, img.size);
                }
            }, 
            async (precentage?: number) => {
                if(precentage && content.id) {
                    content.uploadCompletion = precentage;
                    await this.repository.save(content)
                }

            })

            await this.repository.save(content);
            
        }))
    }
    async findMany <F extends FindManyDTO<ContentSortBy>>(params: F) : Promise<FindManyResponse<Content>> {

        const input : FindParams<ContentSortBy, ContentFilterBy> = {
            pageNumber: params.page_number,
            pageSize: params.page_size,
            sortBy: params.by,
            sortOrder: params.order,
        }
        
        const objectParams = params as any;

        delete objectParams['page_number'];
        delete objectParams['page_size'];
        delete objectParams['by'];
        delete objectParams['order'];

        // assume everything else is filters;

        const filters = convertToFilters<ContentFilterBy>(objectParams as ContentFilterBy);

        input.filters = filters;

        const data = await this.repository.findMany(
            input
        );

        const finalized = await Promise.all(data.data.map(async (v,i) => {
            if(v.locationExpiration && v.locationExpiration < new Date()) return v;
            const results = await this.temporaryLinkService.generate(v.key);
            v.locationExpiration = results.expDate;
            v.location = results.url;
            v.downloadUrl = results.url;
            
            await this.repository.save(v);

            return v;
        }))

        return {
            ...data,
            data: finalized
        };
    }
    
}