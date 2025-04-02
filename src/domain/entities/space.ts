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
     *         usedMegabytes:
     *           type: number
     *           description: The amount of storage used in megabytes
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
     *         - usedMegabytes
     *         - shareType
     */

export interface Space extends Persistent {
    name: string;
    description: string;
    userIds: string[];
    createdByUserId: string;
    usedMegabytes: number;
    shareType: SpaceShareType;
}

