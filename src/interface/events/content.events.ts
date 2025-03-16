import { S3, S3ClientConfig } from "@aws-sdk/client-s3";
import { AWSObjectRemover } from "../../application/services/remove/aws.remove.service";
import { CONTENT_DELETED } from "../../domain/constants/event.names";
import { Content } from "../../domain/entities/content";
import { eventBus } from "../../infrastructure/event/event.bus";
import { ACCESS_KEY_ID_AWS, REGION_AWS, S3_BUCKET_VIDEO_CONTENT_NAME_AWS, SECRET_ACCESS_KEY_AWS } from "../../application/configuration";

eventBus.on<{ content: Content }>(CONTENT_DELETED, async ({ content } : { content: Content }) => {

    try { 
        const s3Config: S3ClientConfig = {
            region: REGION_AWS!,
            credentials: {
                accessKeyId: ACCESS_KEY_ID_AWS!,
                secretAccessKey: SECRET_ACCESS_KEY_AWS!,
            }
        }
        const bucketName = S3_BUCKET_VIDEO_CONTENT_NAME_AWS!;
        const s3Client = new S3(s3Config)

        const removeService: AWSObjectRemover = new AWSObjectRemover(s3Client, bucketName)
        removeService.removeObject(content.key)
        

    } catch(err) {

    }

});