"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const user_routes_1 = require("./routes/user.routes");
const space_routes_1 = require("./routes/space.routes");
const content_routes_1 = require("./routes/content.routes");
const stripe_routes_1 = require("./routes/stripe.routes");
const authenticate_client_middleware_1 = __importDefault(require("./middlewares/authenticate.client.middleware"));
const jwt_token_service_1 = require("../../application/services/token/jwt.token.service");
const configuration_1 = require("../../application/configuration");
class Routes {
    constructor(userUsecase, spaceUseCase, contentUseCase, stripeUseCase) {
        this.userUsecase = userUsecase;
        this.spaceUseCase = spaceUseCase;
        this.contentUseCase = contentUseCase;
        this.stripeUseCase = stripeUseCase;
    }
    register(app) {
        app.use('/api/v1/', (0, authenticate_client_middleware_1.default)(configuration_1.API_KEY_SECRET, new jwt_token_service_1.JwtTokenService()), (0, user_routes_1.UserRoutes)(this.userUsecase), (0, space_routes_1.SpaceRoutes)(this.spaceUseCase), (0, content_routes_1.ContentRoutes)(this.contentUseCase), (0, stripe_routes_1.StripeRoutes)(this.stripeUseCase));
    }
}
exports.Routes = Routes;
