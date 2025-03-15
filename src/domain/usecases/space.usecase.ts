import { NotFoundException } from "../../application/exceptions/not.found";
import { CreateSpaceDTO } from "../../domain/interfaces/presenters/dtos/create.space.dto";
import { UpdateSpaceDTO } from "../../domain/interfaces/presenters/dtos/update.space.dto";
import { Space } from "../entities/space";
import { Subscription } from "../entities/subscription";
import { SubscriptionPlan } from "../entities/subscription.plan";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Usecases } from "./usecases";

export class SpaceUsecase extends Usecases<Space, SpaceSortBy, SpaceFilterBy, SpaceRepository> {
    
    constructor (repository: SpaceRepository) {
        super(repository);
    }

    async mapCreateDtoToEntity(data: CreateSpaceDTO): Promise<Space> {
        const space : Space = {
            id: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: data.name,
            description: data.description,
            userIds: [
                data.createdByUserId
            ],
            createdByUserId: data.createdByUserId,
            usedMegabytes: 0,
            totalMegabytes: 0,
            subscriptionPlanId: null,
            stripeSubscriptionId: null,
            usersAllowed: 1
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

    /**
     * @desc Subscription is created successfully
     * @note This method updates the space on every new subscription creation (i.e - upgrade, downgrade and creation)
     * @params id: Space's id
     * @params subscription: Stripe subscription object from service
     * @params subscriptionPlan: subscription plan entity
     */

    async subscribedToPlan(
        id: string,
        subscription: Subscription,
        subscriptionPlan: SubscriptionPlan
    ): Promise<Space | NotFoundException | Error> {

        try {
            const mb = subscriptionPlan.megabytes;
            const users = subscriptionPlan.users;
            const planId = subscriptionPlan.id;
            const stripSubscriptionId = subscription.id;
    
            const space = await this.repository.findById(id);
    
            if(!space) return new NotFoundException('space not found by id');
    
            space.totalMegabytes = mb;
            space.usersAllowed = users;
            space.subscriptionPlanId = planId;
            space.stripeSubscriptionId = stripSubscriptionId;
            space.pausedAt = undefined;
            space.deactivatedAt = undefined;
    
            const saved = await this.repository.save(space);
    
            return saved;

        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }

    }

    async subscriptionEnd(
        id: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const space = await this.repository.findById(id);
    
            if(!space) return new NotFoundException('space not found by id');

            space.deactivatedAt = new Date();

            const saved = await this.repository.save(space);
    
            return saved;

        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }
    }
    
    async subscriptionPaused(
        id: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const space = await this.repository.findById(id);
    
            if(!space) return new NotFoundException('space not found by id');

            space.pausedAt = new Date();

            const saved = await this.repository.save(space);
    
            return saved;

        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }
    }

    async subscriptionResumed(
        id: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const space = await this.repository.findById(id);
    
            if(!space) return new NotFoundException('space not found by id');

            space.pausedAt = undefined;
            space.deactivatedAt = undefined;

            const saved = await this.repository.save(space);
    
            return saved;

        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }
    }
}