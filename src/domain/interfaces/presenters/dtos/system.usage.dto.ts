import Joi from "joi";

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemUsageResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: User ID
 *             firstName:
 *               type: string
 *               description: User's first name
 *             lastName:
 *               type: string
 *               description: User's last name
 *             email:
 *               type: string
 *               description: User's email
 *             confirmed:
 *               type: boolean
 *               description: Whether email is confirmed
 *             subscriptionPlanExpiresAt:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               description: When subscription expires
 *         storage:
 *           type: object
 *           properties:
 *             usedMegabytes:
 *               type: number
 *               description: Total storage used in MB
 *             maxStorage:
 *               type: number
 *               description: Maximum storage allowed in MB
 *             usagePercentage:
 *               type: number
 *               description: Storage usage percentage
 *         spaces:
 *           type: object
 *           properties:
 *             totalSpaces:
 *               type: number
 *               description: Number of spaces created
 *             maxSpaces:
 *               type: number
 *               description: Maximum spaces allowed
 *             spacesUsagePercentage:
 *               type: number
 *               description: Spaces usage percentage
 *         limits:
 *           type: object
 *           properties:
 *             maxUsers:
 *               type: number
 *               description: Maximum users allowed
 *             maxAiEnhancementsPerMonth:
 *               type: number
 *               description: Maximum AI enhancements per month
 *         spaceDetails:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Space ID
 *               name:
 *                 type: string
 *                 description: Space name
 *               usedMegabytes:
 *                 type: number
 *                 description: Storage used by this space
 *               shareType:
 *                 type: string
 *                 description: Space share type
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: When space was created
 */

export type SystemUsageResponse = {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        confirmed: boolean;
        subscriptionPlanExpiresAt?: Date;
    };
    storage: {
        usedMegabytes: number;
        maxStorage: number;
        usagePercentage: number;
    };
    spaces: {
        totalSpaces: number;
        maxSpaces: number;
        spacesUsagePercentage: number;
    };
    limits: {
        maxUsers: number;
        maxAiEnhancementsPerMonth: number;
    };
    spaceDetails: Array<{
        id: string;
        name: string;
        usedMegabytes: number;
        shareType: string;
        createdAt: Date;
    }>;
};

// No validation schema needed as this is a GET endpoint with no parameters 