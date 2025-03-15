import { CreateUserDTO } from "../../domain/interfaces/presenters/dtos/create.user.dto";
import { UpdateUserDTO } from "../../domain/interfaces/presenters/dtos/update.user.dto";
import { PasswordService } from "../../application/services/password/password.service";
import { User } from "../entities/user";
import { Usecases } from "./usecases";
import { Content } from "../entities/content";
import { ContentFilterBy, ContentSortBy } from "../types/content";
import { ContentRepository } from "../repositories/content.repository";
import { CreateContentDTO } from "../interfaces/presenters/dtos/create.content.dto";

export class ContentUsecase extends Usecases<Content, ContentSortBy, ContentFilterBy, ContentRepository> {
    constructor (repository: ContentRepository) {
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
            spaceId: data.spaceId
        }

        return content;
    }
    async mapUpdateDtoToEntity(data: UpdateUserDTO, item: Content): Promise<Content> {

        const content : Content = {
            ...item,
            ...data
        }

        return content;
    }
    
}