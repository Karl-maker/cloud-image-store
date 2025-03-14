import { Feature, Price } from "../types/common";
import { Persistent } from "./persistent";

export interface SubscriptionPlan extends Persistent {
    name: string;
    description: string;
    megabytes: number;
    prices: Price [];
    features: Feature [];
}       