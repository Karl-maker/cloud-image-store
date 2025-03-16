import { Feature, Price } from "../types/common";
import { Persistent } from "./persistent";

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlanResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the subscription plan
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the subscription plan was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the subscription plan was last updated
 *         name:
 *           type: string
 *           description: Name of the subscription plan
 *         description:
 *           type: string
 *           description: Detailed description of the subscription plan
 *         megabytes:
 *           type: number
 *           description: Amount of storage (in MB) allocated in the plan
 *         users:
 *           type: number
 *           description: Maximum number of users allowed in this subscription
 *         prices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Price'
 *           description: List of pricing options available for this plan
 *         features:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Feature'
 *           description: List of features included in the subscription plan
 *       required:
 *         - id
 *         - createdAt
 *         - updatedAt
 *         - name
 *         - description
 *         - megabytes
 *         - users
 *         - prices
 *         - features
 */

export interface SubscriptionPlan extends Persistent {
    name: string;
    description: string;
    megabytes: number;
    users: number;
    prices: Price [];
    features: Feature [];
}       