import { Express } from "express";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserRoutes } from "./routes/user.routes";
import { SpaceRoutes } from "./routes/space.routes";
import { SpaceUsecase } from "../../domain/usecases/space.usecase";

export class Routes {
    constructor(
        private readonly userUsecase: UserUsecase,
        private readonly spaceUseCase: SpaceUsecase
    ) {}

    register(app: Express) {
        app.use(
            '/api/v1/',
            UserRoutes(this.userUsecase),
            SpaceRoutes(this.spaceUseCase)
        )
    }
}