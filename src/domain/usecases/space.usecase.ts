import { NotFoundException } from "../../application/exceptions/not.found";
import { CreateSpaceDTO } from "../interfaces/presenters/dtos/create.space.dto";
import { UpdateSpaceDTO } from "../interfaces/presenters/dtos/update.space.dto";
import { Space } from "../entities/space";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Usecases } from "./usecases";
import { UserRepository } from "../repositories/user.repository";

export class SpaceUsecase extends Usecases<Space, SpaceSortBy, SpaceFilterBy, SpaceRepository> {
    
    constructor (
        repository: SpaceRepository, 
        public userRepository: UserRepository) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateSpaceDTO): Promise<Space> {
        const space : Space = {
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: data.name,
            description: data.description,
            userIds: [],
            createdByUserId: data.createdByUserId,
            usedMegabytes: 0,
            shareType: data.shareType,
        }

        return space;
    }
    async mapUpdateDtoToEntity(data: UpdateSpaceDTO, item: Space): Promise<Space> {

        const space : Space = {
            ...item,
            ...data
        }

        return space;
    }

    async addMemory(spaceId: string, amount: number) : Promise<void> {
        const space = await this.repository.findById(spaceId);
        if(!space) throw new NotFoundException('space not found');

        space.usedMegabytes = space.usedMegabytes + amount;
        await this.repository.save(space);
    }
}