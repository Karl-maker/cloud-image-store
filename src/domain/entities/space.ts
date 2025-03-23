import { SpaceShareType } from "../types/space";
import { Persistent } from "./persistent";

    /**
     * @swagger
     * components:
     *   schemas:
     *     SpaceResponse:
     *       type: object
     *       properties:
     *         id:
     *           type: string
     *           format: uuid
     *           description: Unique identifier for the space
     *         createdAt:
     *           type: string
     *           format: date-time
     *           description: Timestamp when the space was created
     *         updatedAt:
     *           type: string
     *           format: date-time
     *           description: Timestamp when the space was last updated
     *         name:
     *           type: string
     *           description: Name of the space
     *         description:
     *           type: string
     *           description: Detailed description of the space
     *         userIds:
     *           type: array
     *           items:
     *             type: string
     *             format: uuid
     *           description: List of user IDs associated with the space
     *         createdByUserId:
     *           type: string
     *           format: uuid
     *           description: User ID of the creator of the space
     *         usersAllowed:
     *           type: integer
     *           description: Maximum number of users allowed in the space
     *         pausedAt:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: Timestamp when the space was paused, if applicable
     *         deactivatedAt:
     *           type: string
     *           format: date-time
     *           nullable: true
     *           description: Timestamp when the space was deactivated, if applicable
     *         usedMegabytes:
     *           type: number
     *           description: The amount of storage used in megabytes
     *         totalMegabytes:
     *           type: number
     *           description: The total storage capacity in megabytes
     *         subscriptionPlanId:
     *           type: string
     *           format: uuid
     *           nullable: true
     *           description: ID of the associated subscription plan, if applicable
     *         stripeSubscriptionId:
     *           type: string
     *           nullable: true
     *           description: Stripe subscription ID linked to the space
     *         shareType:
     *           type: string
     *           enum: [invite, public, private]
     *           description: share type for space.
     *       required:
     *         - id
     *         - createdAt
     *         - updatedAt
     *         - name
     *         - description
     *         - userIds
     *         - createdByUserId
     *         - usersAllowed
     *         - usedMegabytes
     *         - totalMegabytes
     *         - shareType
     */

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
    shareType: SpaceShareType;
    subscriptionPlanId: string | null;
    stripeSubscriptionId: string | null;
    aiGenerationsPerMonth?: number;
}

