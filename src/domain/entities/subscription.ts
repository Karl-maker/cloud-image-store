import { Persistent } from "./persistent";

export interface Subscription extends Persistent {
    userId: string;
    spaceId: string;
    subscriptionPlanId: string;
}