import { Express } from "express";
import { UserUsecase } from "../../domain/usecases/user.usecase";
import { UserRoutes } from "./routes/user.routes";

export class Routes {
    constructor(
        private readonly userUsecase: UserUsecase,
    ) {}

    register(app: Express) {
        app.use(
            '/api/v1/',
            UserRoutes(this.userUsecase)
        )
    }
}