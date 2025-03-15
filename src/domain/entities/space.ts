import { Persistent } from "./persistent";

export interface Space extends Persistent {
    name: string;
    description: string;
    userIds: string[];
    createdByUserId: string;
    usersAllowed: number;
    pausedAt?: Date;
    deactivatedAt?: Date;
    usedMegabytes: number;
    totalMegabytes: number;
    subscriptionPlanId: string | null;
    stripeSubscriptionId: string | null;
}
