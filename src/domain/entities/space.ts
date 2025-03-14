import { Persistent } from "./persistent";

export interface Space extends Persistent {
    name: string;
    description: string;
    userIds: string[];
    createdByUserId: string;
    pausedAt?: Date;
    deactivatedAt?: Date;
    usedMegabytes: number;
    totalMegabytes: number;
    subscriptionPlanId: string;
}
