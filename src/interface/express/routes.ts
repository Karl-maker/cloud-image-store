import { Express } from "express";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserRoutes } from "./routes/user.routes";
import { SpaceRoutes } from "./routes/space.routes";
import { SpaceUsecase } from "../../domain/usecases/space.usecase";
import { ContentUsecase } from "../../domain/usecases/content.usecase";
import { ContentRoutes } from "./routes/content.routes";
import { StripeRoutes } from "./routes/stripe.routes";
import { StripeUsecase } from "../../domain/usecases/stripe.usecase";
import authenticateClient from "./middlewares/authenticate.client.middleware";
import { JwtTokenService } from "../../application/services/token/jwt.token.service";
import { API_KEY_SECRET } from "../../application/configuration";

export class Routes {
    constructor(
        private readonly userUsecase: UserUsecase,
        private readonly spaceUseCase: SpaceUsecase,
        private readonly contentUseCase: ContentUsecase,
        private readonly stripeUseCase: StripeUsecase
    ) {}

    register(app: Express) {
        app.use(
            '/api/v1/',
            authenticateClient(API_KEY_SECRET!, new JwtTokenService()),
            UserRoutes(this.userUsecase),
            SpaceRoutes(this.spaceUseCase),
            ContentRoutes(this.contentUseCase),
            StripeRoutes(this.stripeUseCase)
        )
    }
}