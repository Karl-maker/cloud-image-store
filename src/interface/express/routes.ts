import { Express } from "express";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserRoutes } from "./routes/user.routes";
import { SpaceRoutes } from "./routes/space.routes";
import { SpaceUsecase } from "../../domain/usecases/space.usecase";
import { ContentUsecase } from "../../domain/usecases/content.usecase";
import { ContentRoutes } from "./routes/content.routes";

export class Routes {
    constructor(
        private readonly userUsecase: UserUsecase,
        private readonly spaceUseCase: SpaceUsecase,
        private readonly contentUseCase: ContentUsecase
    ) {}

    register(app: Express) {
        app.use(
            '/api/v1/',
            UserRoutes(this.userUsecase),
            SpaceRoutes(this.spaceUseCase),
            ContentRoutes(this.contentUseCase)
        )
    }
}