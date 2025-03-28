import { Persistent } from "./persistent";

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the content was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the content was last updated
 *         name:
 *           type: string
 *           description: Name of the content
 *         description:
 *           type: string
 *           nullable: true
 *           description: Optional description of the content
 *         key:
 *           type: string
 *           description: Unique storage key for the content in the storage provider
 *         mimeType:
 *           type: string
 *           description: MIME type of the content (e.g., image/png, video/mp4)
 *         location:
 *           type: string
 *           description: URL or storage location of the content
 *         uploadCompletion:
 *           type: number
 *           description: Upload progress percentage (0 to 100)
 *         uploadError:
 *           type: string
 *           nullable: true
 *           description: Error message if the upload fails
 *         length:
 *           type: number
 *           nullable: true
 *           description: Length of the content (e.g., duration for videos, pages for documents)
 *         spaceId:
 *           type: string
 *           format: uuid
 *           description: The ID of the space to which this content belongs
 *         size:
 *           type: number
 *           description: Size of the content in bytes
 *         height:
 *           type: number
 *           description: height of image
 *         width:
 *           type: number
 *           description: width of image
 *         ai:
 *           type: boolean
 *           description: if it was created by ai
 *         favorite:
 *           type: boolean
 *           description: image can be favourited
 *         downloadUrl:
 *           type: string
 *           description: url for downloading content
 *       required:
 *         - id
 *         - createdAt
 *         - updatedAt
 *         - name
 *         - key
 *         - mimeType
 *         - location
 *         - uploadCompletion
 *         - spaceId
 *         - size
 */

export interface Content extends Persistent {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    uploadCompletion: number;
    uploadError?: string;
    length?: number;
    downloadUrl?: string;
    spaceId: string;
    size: number;
    height?: number;
    width?: number;
    ai?: boolean;
    favorite?: boolean;
}

