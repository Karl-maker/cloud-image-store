import express, { ErrorRequestHandler } from "express";
import { Database } from "../../application/configuration/mongodb";
import { ACCESS_KEY_ID_AWS, API_KEY_SECRET, COMPANY_DOMAIN, DEEP_AI_KEY, MONGO_URI, OPEN_AI_KEY, PORT, REGION_AWS, S3_BUCKET_NAME_AWS, SECRET_ACCESS_KEY_AWS, STRIPE_KEY, STRIPE_WEBHOOK_SECRET, TOKEN_SECRET } from "../../application/configuration";
import { JwtTokenService } from "../../application/services/token/jwt.token.service";
import cors from 'cors';
import helmet from 'helmet';
import cron from "node-cron";
import errorHandler from "./middlewares/error.middleware";
import { setupSwagger, swaggerSpec } from "./swagger.doc";
import swaggerYamlConverter from "../../bin/create.swagger.yaml";
import { Routes } from "./routes";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserMongooseRepository } from "../../infrastructure/mongoose/repositories/user.mongoose.repository";
import { SpaceRepository } from "../../domain/repositories/space.repository";
import { SpaceMongooseRepository } from "../../infrastructure/mongoose/repositories/space.mongoose.repository";
import { SpaceUsecase } from "../../domain/usecases/space.usecase";
import { ContentUsecase } from "../../domain/usecases/content.usecase";
import { ContentMongooseRepository } from "../../infrastructure/mongoose/repositories/content.mongoose.repository";
import { ContentRepository } from "../../domain/repositories/content.repository";
import IUploadService from "../../application/services/upload/i.upload.service";
import S3UploadService from "../../application/services/upload/aws.upload.service";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { StripeUsecase } from "../../domain/usecases/stripe.usecase";
import Stripe from "stripe";
import { CONTENT_PARAM_PATH, CONTENT_PATH, CONTENT_VIEW_PATH, STRIPE_PATH, UPLOAD_PATH, WEBHOOK_PATH } from "../../domain/constants/api.routes";
import { StripeController } from "./controllers/stripe.controller";
import multer from "multer";
import authentication from "./middlewares/authentication.middleware";
import { validateUploadEndpoint } from "./routes/content.routes";
import { ContentController } from "./controllers/content.controller";
import { OpenaiImageVariant } from "../../application/services/ai/openai.image.variant";
import { S3GetBlobService } from "../../application/services/blob/aws.get.blob.service";
import { DeepaiImageVariant } from "../../application/services/ai/deepai.image.variant";
import { DEEP_AI_IMAGE_GEN_VARIATION } from "../../domain/constants/deep.ai";
import { DatabaseIndexManager } from "../../utils/database.index.util";
import { healthRoutes } from "./routes/health.routes";

import "../events/content.events";
import "../events/user.events";

import verifyUploadContent, { verifyUploadPermissions } from "./middlewares/verify.upload.content";
import S3TemporaryLinkService from "../../application/services/temporary-link/aws.temporary.link.service";
import { rateLimiter } from "./middlewares/rate.limit";
import authorization from "./middlewares/authorization.middleware";

export const app = express();

// Initialize the server without starting it automatically
export const initializeServer = async () => {
    await Database.connect(MONGO_URI!); // Connect to MongoDB with pooling
    
    // Create all database indexes
    await DatabaseIndexManager.createAllIndexes();
    
    const connection = Database.getConnection();
    const expDateForContent = 60 * 60 * 24 * 7;
    const userRepository : UserRepository = new UserMongooseRepository(connection);
    const spaceRepository : SpaceRepository = new SpaceMongooseRepository(connection);
    const contentRepository : ContentRepository = new ContentMongooseRepository(connection)

    const s3Config: S3ClientConfig = {
        region: REGION_AWS!,
        credentials: {
            accessKeyId: ACCESS_KEY_ID_AWS!,
            secretAccessKey: SECRET_ACCESS_KEY_AWS!,
        }
    }

    const bucketName = S3_BUCKET_NAME_AWS!;
    const stripe = new Stripe(STRIPE_KEY!, { apiVersion: '2025-02-24.acacia' });
    const uploadService : IUploadService = new S3UploadService(s3Config, bucketName);
    const upload = multer({ storage: multer.memoryStorage() });
    const routes = new Routes(
        new UserUsecase(userRepository, spaceRepository),
        new SpaceUsecase(spaceRepository, userRepository),
        new ContentUsecase(contentRepository, uploadService, new SpaceUsecase(spaceRepository, userRepository), new DeepaiImageVariant(DEEP_AI_KEY!, DEEP_AI_IMAGE_GEN_VARIATION), new S3GetBlobService(s3Config, bucketName), new S3TemporaryLinkService(bucketName, s3Config, expDateForContent)),
        new StripeUsecase(stripe, new SpaceUsecase(spaceRepository, userRepository), new UserUsecase(userRepository, spaceRepository))
    )

    const stripeController = new StripeController(
        new StripeUsecase(stripe, new SpaceUsecase(spaceRepository, userRepository), new UserUsecase(userRepository)),
        stripe,
        STRIPE_WEBHOOK_SECRET!
    );

    const contentController = new ContentController(new ContentUsecase(contentRepository, uploadService, new SpaceUsecase(spaceRepository, userRepository), new OpenaiImageVariant(DEEP_AI_KEY!, DEEP_AI_IMAGE_GEN_VARIATION), new S3GetBlobService(s3Config, bucketName), new S3TemporaryLinkService(bucketName, s3Config, expDateForContent)))

    const allowedOrigins = [
        new URL(COMPANY_DOMAIN!).origin!
    ];

    app.use(helmet());

    app.post(STRIPE_PATH + WEBHOOK_PATH, express.raw({ type: 'application/json' }), stripeController.webhook.bind(stripeController))

    setupSwagger(app)
    swaggerYamlConverter(swaggerSpec)

    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', "x-api-key"],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    }));

    app.use(express.json());

    // Add health check route
    app.use('/api/v1', healthRoutes);

    app.post('/api/v1' + CONTENT_PATH + UPLOAD_PATH, upload.array('files', 10), authentication(TOKEN_SECRET!, new JwtTokenService(), true), validateUploadEndpoint, verifyUploadContent(spaceRepository, userRepository), authorization(verifyUploadPermissions), contentController.upload.bind(contentController))
    app.options(CONTENT_VIEW_PATH + '/*', rateLimiter, (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', COMPANY_DOMAIN!);
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        res.setHeader('Accept-Ranges', 'bytes');
        res.sendStatus(204);
    });

    app.get(CONTENT_VIEW_PATH + '/*', contentController.redirectToS3(S3_BUCKET_NAME_AWS!, s3Config))

    routes.register(app)

    app.use(errorHandler as unknown as ErrorRequestHandler)

    return app;
};

// Only start the server when not in test mode
if (process.env.NODE_ENV !== "test") {
    (async () => {
        await initializeServer();
        app.listen(PORT!, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })();
}

// CRON Job for upkeep

cron.schedule("*/5 * * * *", async () => {
    //
});
  