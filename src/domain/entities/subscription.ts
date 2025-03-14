import { Persistent } from "./persistent";

export interface Subscription extends Persistent {
    customerId: string;
    planId: string;
    status: 'active' | 'paused' | 'canceled';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
}