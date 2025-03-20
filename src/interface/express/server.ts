import express, { ErrorRequestHandler } from "express";
import authenticateClient from "./middlewares/authenticate.client.middleware";
import { Database } from "../../application/configuration/mongodb";
import { ACCESS_KEY_ID_AWS, API_KEY_SECRET, COMPANY_DOMAIN, MONGO_URI, PORT, REGION_AWS, S3_BUCKET_NAME_AWS, SECRET_ACCESS_KEY_AWS, STRIPE_KEY, STRIPE_WEBHOOK_SECRET } from "../../application/configuration";
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

import "../events/content.events";
import "../events/space.event";
import { STRIPE_PATH, WEBHOOK_PATH } from "../../domain/constants/api.routes";
import { StripeController } from "./controllers/stripe.controller";

export const app = express();

// Initialize the server without starting it automatically
export const initializeServer = async () => {
    await Database.connect(MONGO_URI!); // Connect to MongoDB
    const connection = Database.getConnection();

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

    const routes = new Routes(
        new UserUsecase(userRepository),
        new SpaceUsecase(spaceRepository),
        new ContentUsecase(contentRepository, uploadService, new SpaceUsecase(spaceRepository)),
        new StripeUsecase(stripe, new SpaceUsecase(spaceRepository))
    )

    const stripeController = new StripeController(
        new StripeUsecase(stripe, new SpaceUsecase(spaceRepository)),
        stripe,
        STRIPE_WEBHOOK_SECRET!
    );

    const allowedOrigins = [
        COMPANY_DOMAIN!,
        'localhost:3001'
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
  