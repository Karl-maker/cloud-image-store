import { Persistent } from "./persistent";

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the subscription.
 *         customerId:
 *           type: string
 *           description: The ID of the customer associated with the subscription.
 *         planId:
 *           type: string
 *           description: The ID of the subscription plan.
 *         status:
 *           type: string
 *           enum: [active, paused, canceled]
 *           description: The current status of the subscription.
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The date when the subscription started.
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: The date when the subscription ends.
 *         autoRenew:
 *           type: boolean
 *           description: Whether the subscription will automatically renew.
 *         trial:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: The trial period end date, if applicable.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the subscription was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the subscription was last updated.
 */


export interface Subscription extends Persistent {
    customerId: string;
    planId: string;
    status: 'active' | 'paused' | 'canceled';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    trial?: Date;
}