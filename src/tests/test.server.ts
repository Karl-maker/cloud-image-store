import express, { Application } from 'express';
import { MockUserRepository } from './mock.user.repository';
import { MockSpaceRepository } from './mock.space.repository';
import { MockContentRepository } from './mock.content.repository';
import { MockUploadService } from './mocks/mock.upload.service';
import { MockEmailService } from './mocks/mock.email.service';
import { MockStripeService } from './mocks/mock.stripe.service';
import { UserUsecase } from '../domain/usecases/user.usecase';
import { SpaceUsecase } from '../domain/usecases/space.usecase';
import { ContentUsecase } from '../domain/usecases/content.usecase';
import { StripeUsecase } from '../domain/usecases/stripe.usecase';
import { Routes } from '../interface/express/routes';
import { UserController } from '../interface/express/controllers/user.controller';
import { SpaceController } from '../interface/express/controllers/space.controller';
import { ContentController } from '../interface/express/controllers/content.controller';
import { StripeController } from '../interface/express/controllers/stripe.controller';
import { JwtTokenService } from '../application/services/token/jwt.token.service';
import { TOKEN_SECRET, API_KEY_SECRET } from '../application/configuration';
import authentication from '../interface/express/middlewares/authentication.middleware';
import authenticateClient from '../interface/express/middlewares/authenticate.client.middleware';
import errorHandler from '../interface/express/middlewares/error.middleware';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';

export class TestServer {
    public app: Application;
    public mockUserRepository: MockUserRepository = new MockUserRepository();
    public mockSpaceRepository: MockSpaceRepository = new MockSpaceRepository();
    public mockContentRepository: MockContentRepository = new MockContentRepository();
    public mockUploadService: MockUploadService = new MockUploadService();
    public mockEmailService: MockEmailService = new MockEmailService();
    public mockStripeService: MockStripeService = new MockStripeService();

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
        }));
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        // Create usecases with mock repositories
        const userUsecase = new UserUsecase(this.mockUserRepository);
        const spaceUsecase = new SpaceUsecase(this.mockSpaceRepository, this.mockUserRepository);
        const contentUsecase = new ContentUsecase(
            this.mockContentRepository,
            this.mockUploadService,
            spaceUsecase,
            null as any, // AI service mock
            null as any, // Blob service mock
            null as any  // Temporary link service mock
        );
        const stripeUsecase = new StripeUsecase(
            this.mockStripeService as any,
            spaceUsecase,
            userUsecase
        );

        // Create controllers
        const userController = new UserController(userUsecase);
        const spaceController = new SpaceController(spaceUsecase);
        const contentController = new ContentController(contentUsecase);
        const stripeController = new StripeController(
            stripeUsecase,
            this.mockStripeService as any,
            'mock-webhook-secret'
        );

        // Setup routes
        const routes = new Routes(userUsecase, spaceUsecase, contentUsecase, stripeUsecase);
        routes.register(this.app as any);

        // Add authentication middleware to protected routes
        this.app.use('/api/v1/user', authentication(TOKEN_SECRET!, new JwtTokenService()));
        this.app.use('/api/v1/space', authentication(TOKEN_SECRET!, new JwtTokenService()));
        this.app.use('/api/v1/content', authentication(TOKEN_SECRET!, new JwtTokenService()));
        this.app.use('/api/v1/stripe', authenticateClient(API_KEY_SECRET!, new JwtTokenService()));

        // Bind controller methods
        this.app.post('/api/v1/user/register', userController.register.bind(userController));
        this.app.post('/api/v1/user/login', userController.login.bind(userController));
        this.app.post('/api/v1/user/send-confirmation', userController.generateConfirmation.bind(userController));
        this.app.post('/api/v1/user/recover', userController.generateRecover.bind(userController));
        this.app.post('/api/v1/user/verify-confirmation', userController.confirm.bind(userController));
        this.app.get('/api/v1/user/profile', userController.me.bind(userController));
        this.app.put('/api/v1/user/profile', userController.updateById.bind(userController));
    }

    private setupErrorHandling(): void {
        this.app.use(errorHandler as any);
    }

    public clearAllData(): void {
        this.mockUserRepository = new MockUserRepository();
        this.mockSpaceRepository = new MockSpaceRepository();
        this.mockContentRepository = new MockContentRepository();
        this.mockEmailService.clearSentEmails();
        this.mockStripeService.clearAllData();
    }

    public getServer(): Application {
        return this.app;
    }
} 