import { NotFoundException } from "../../application/exceptions/not.found";
import { CreateSpaceDTO } from "../interfaces/presenters/dtos/create.space.dto";
import { UpdateSpaceDTO } from "../interfaces/presenters/dtos/update.space.dto";
import { Space } from "../entities/space";
import { Subscription } from "../entities/subscription";
import { SubscriptionPlan } from "../entities/subscription.plan";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Usecases } from "./usecases";
import { bytesToMB } from "../../utils/bytes.to.mb";

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
            userIds: [],
            createdByUserId: data.createdByUserId,
            usedMegabytes: 0,
            totalMegabytes: 0,
            subscriptionPlanId: null,
            stripeSubscriptionId: null,
            usersAllowed: 1,
            shareType: data.shareType,
            aiGenerationsPerMonth: 0
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
            space.aiGenerationsPerMonth = subscriptionPlan.aiGenerationsPerMonth ?? 0;
    
            const saved = await this.repository.save(space);
    
            return saved;

        } catch(err: unknown) {
            if(err instanceof Error) return err;
            return new Error(`${err}`);
        }

    }

    async subscriptionEnd(
        stripSubscriptionId: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const spaces = await this.repository.findMany({
                filters: {
                    stripeSubscriptionId: {
                        exact: stripSubscriptionId
                    }
                }
            });

            const space = spaces.data[0]
    
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
        stripSubscriptionId: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const spaces = await this.repository.findMany({
                filters: {
                    stripeSubscriptionId: {
                        exact: stripSubscriptionId
                    }
                }
            });

            const space = spaces.data[0]

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
        stripSubscriptionId: string,
    ): Promise<Space | NotFoundException | Error> {
        try {
            const spaces = await this.repository.findMany({
                filters: {
                    stripeSubscriptionId: {
                        exact: stripSubscriptionId
                    }
                }
            });

            const space = spaces.data[0]

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

    async hasMemory(spaceId: string, amount: number) : Promise<boolean> {
        const space = await this.repository.findById(spaceId);
        if(!space) throw new NotFoundException('space not found');
        return (space.usedMegabytes + this.bytesToMB(amount)) < space.totalMegabytes;
    }

    async addMemory(spaceId: string, amount: number) : Promise<void> {
        const space = await this.repository.findById(spaceId);
        if(!space) throw new NotFoundException('space not found');

        space.usedMegabytes = space.usedMegabytes + amount;
        await this.repository.save(space);
    }

    private bytesToMB(bytes: number): number {
        return bytesToMB(bytes);
    }
}