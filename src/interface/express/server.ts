import express, { ErrorRequestHandler } from "express";
import authenticateClient from "./middlewares/authenticate.client.middleware";
import { Database } from "../../application/configuration/mongodb";
import { API_KEY_SECRET, COMPANY_DOMAIN, MONGO_URI, PORT } from "../../application/configuration";
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

/**
 * @NOTE Add events here 
 * @example 
 * 
 * import '../path/to/event`
 */


export const app = express();

// Initialize the server without starting it automatically
export const initializeServer = async () => {
    await Database.connect(MONGO_URI!); // Connect to MongoDB
    const connection = Database.getConnection();

    const userRepository : UserRepository = new UserMongooseRepository(connection);
    const spaceRepository : SpaceRepository = new SpaceMongooseRepository(connection);
    const contentRepository : ContentRepository = new ContentMongooseRepository(connection)
    const routes = new Routes(
        new UserUsecase(userRepository),
        new SpaceUsecase(spaceRepository),
        new ContentUsecase(contentRepository)
    )

    const allowedOrigins = [
        COMPANY_DOMAIN!,
    ];

    app.use(helmet());

    setupSwagger(app)
    swaggerYamlConverter(swaggerSpec)
    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', "x-api-key"],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    }));
    app.use(express.json());
    // app.use(handle(i18next));
    app.use(authenticateClient(API_KEY_SECRET!, new JwtTokenService()))

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
  