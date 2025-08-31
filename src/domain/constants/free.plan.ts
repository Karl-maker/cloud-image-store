import { SubscriptionPlan } from "../entities/subscription.plan";

export const FREE_PLAN_ID = 'free';
export const FREE_PLAN : SubscriptionPlan = {
    id: FREE_PLAN_ID,
    name: 'Free Plan',
    description: 'Start for free and get access to basic features and functionality including unlimited guest collaboration and theater mode to view memories in beautiful quality.',
    megabytes: 1024 / 2,
    users: 1,
    spaces: 1,
    aiGenerationsPerMonth: 0,
    prices: [
        {
            id: FREE_PLAN_ID,
            amount: 0,
            currency: 'usd',
            recurring: true,
            period: 'year',
            frequency: 1
        },
        {
            id: FREE_PLAN_ID,
            amount: 0,
            currency: 'usd',
            recurring: true,
            period: 'month',
            frequency: 1
        }
    ],
    features: [
        {"name":"Upload photos and videos","included":true},
        {"name":"QR code collaboration with guests","included":true},
        {"name":"Theater mode","included":true},
        {"name":"Favorite moments","included":true},
        {"name":"AI touch-ups","included":false},
        {"name":"Priority customer support","included":true},
        {"name":"Regular system improvements","included":true}
    ],
    highlighted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
}