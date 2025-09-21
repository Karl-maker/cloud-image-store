import { Link } from "../entities/link";
import { CreateLinkDTO } from "../interfaces/presenters/dtos/create.link.dto";
import { LinkRepository } from "../repositories/link.repository";
import { LinkFilterBy, LinkSortBy } from "../types/link";
import { Usecases } from "./usecases";

export class LinkUsecase extends Usecases<Link, LinkSortBy, LinkFilterBy, LinkRepository> {
    
    async mapCreateDtoToEntity(data: CreateLinkDTO): Promise<Link> {
        const link : Link = {
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            token: data.token,
            spaceId: data.spaceId
        }

        return link;
    }

    mapUpdateDtoToEntity(data: unknown, entity: Link): Promise<Link> {
        throw new Error("Method not implemented.");
    }
    constructor (
        repository: LinkRepository
    ) {
        super(repository);
    }

}