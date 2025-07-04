import { Persistent } from "./persistent";

    /**
     * @swagger
     * components:
     *   schemas:
     *     UserResponse:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *           format: uuid
     *           description: Unique identifier for the user
     *         createdAt:
     *           type: string
     *           format: date-time
     *           description: Timestamp when the user was created
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           description: Timestamp when the user was last updated
     *         firstName:
     *           type: string
     *           description: The first name of the user
     *         lastName:
     *           type: string
     *           description: The last name of the user
     *         email:
     *           type: string
     *           format: email
     *           description: The email address of the user
     *         confirmed:
     *           type: boolean
     *           description: Whether the user has confirmed their email
     *         stripeId:
     *           type: string
     *           nullable: true
     *           description: Stripe customer ID associated with the user
     *         maxUsers:
     *           type: number
     *           nullable: true
     *           description: Number of users allowed on account
     *         lastPasswordUpdate:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: Timestamp when the password was last updated
     *         deactivatedAt:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: Timestamp when the user was deactivated
     *         subscriptionStripeId:
     *           type: string
     *           nullable: true
     *           description: id for stripe subscription id
     *         subscriptionPlanStripeId:
     *           type: string
     *           nullable: true
     *           description: id for stripe plan id
     *         subscriptionPlanExpiresAt:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: Timestamp when the subscription plan expires
     *       required:
     *         - id
     *         - createdAt
     *         - updatedAt
     *         - firstName
     *         - lastName
     *         - email
     *         - confirmed
     */

export interface User extends Persistent {
    firstName: string;
    lastName: string;
    email: string;
    hashPassword: string;
    salt: string;
    confirmed: boolean;
    stripeId: string | null;
    lastPasswordUpdate?: Date;
    deactivatedAt?: Date;
    maxUsers: number;
    maxSpaces: number;
    maxStorage: number;
    maxAiEnhancementsPerMonth: number; 
    subscriptionStripeId?: string;
    subscriptionPlanStripeId?: string;
    subscriptionPlanExpiresAt?: Date;
}

