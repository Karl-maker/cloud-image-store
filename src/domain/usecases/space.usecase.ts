import { CreateSpaceDTO } from "../../domain/interfaces/presenters/dtos/create.space.dto";
import { UpdateSpaceDTO } from "../../domain/interfaces/presenters/dtos/update.space.dto";
import { Space } from "../entities/space";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Usecases } from "./usecases";

export class SpaceUsecase extends Usecases<Space, SpaceSortBy, SpaceFilterBy> {
    
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
            totalMegabytes: data.totalMegabytes,
            subscriptionPlanId: data.subscriptionPlanId,
            stripeSubscriptionId: null
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
    
}