"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("../../application/configuration/mongodb");
const configuration_1 = require("../../application/configuration");
const jwt_token_service_1 = require("../../application/services/token/jwt.token.service");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const node_cron_1 = __importDefault(require("node-cron"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const swagger_doc_1 = require("./swagger.doc");
const create_swagger_yaml_1 = __importDefault(require("../../bin/create.swagger.yaml"));
const routes_1 = require("./routes");
const user_usecase_1 = require("../../domain/usecases/user.usecase");
const user_mongoose_repository_1 = require("../../infrastructure/mongoose/repositories/user.mongoose.repository");
const space_mongoose_repository_1 = require("../../infrastructure/mongoose/repositories/space.mongoose.repository");
const space_usecase_1 = require("../../domain/usecases/space.usecase");
const content_usecase_1 = require("../../domain/usecases/content.usecase");
const content_mongoose_repository_1 = require("../../infrastructure/mongoose/repositories/content.mongoose.repository");
const aws_upload_service_1 = __importDefault(require("../../application/services/upload/aws.upload.service"));
const stripe_usecase_1 = require("../../domain/usecases/stripe.usecase");
const stripe_1 = __importDefault(require("stripe"));
const api_routes_1 = require("../../domain/constants/api.routes");
const stripe_controller_1 = require("./controllers/stripe.controller");
const multer_1 = __importDefault(require("multer"));
const authentication_middleware_1 = __importDefault(require("./middlewares/authentication.middleware"));
const content_routes_1 = require("./routes/content.routes");
const content_controller_1 = require("./controllers/content.controller");
const openai_image_variant_1 = require("../../application/services/ai/openai.image.variant");
const aws_get_blob_service_1 = require("../../application/services/blob/aws.get.blob.service");
const deepai_image_variant_1 = require("../../application/services/ai/deepai.image.variant");
const deep_ai_1 = require("../../domain/constants/deep.ai");
require("../events/content.events");
require("../events/user.events");
const verify_upload_content_1 = __importStar(require("./middlewares/verify.upload.content"));
const aws_temporary_link_service_1 = __importDefault(require("../../application/services/temporary-link/aws.temporary.link.service"));
const rate_limit_1 = require("./middlewares/rate.limit");
const authorization_middleware_1 = __importDefault(require("./middlewares/authorization.middleware"));
exports.app = (0, express_1.default)();
// Initialize the server without starting it automatically
const initializeServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongodb_1.Database.connect(configuration_1.MONGO_URI); // Connect to MongoDB
    const connection = mongodb_1.Database.getConnection();
    const expDateForContent = 60 * 60 * 24 * 7;
    const userRepository = new user_mongoose_repository_1.UserMongooseRepository(connection);
    const spaceRepository = new space_mongoose_repository_1.SpaceMongooseRepository(connection);
    const contentRepository = new content_mongoose_repository_1.ContentMongooseRepository(connection);
    const s3Config = {
        region: configuration_1.REGION_AWS,
        credentials: {
            accessKeyId: configuration_1.ACCESS_KEY_ID_AWS,
            secretAccessKey: configuration_1.SECRET_ACCESS_KEY_AWS,
        }
    };
    const bucketName = configuration_1.S3_BUCKET_NAME_AWS;
    const stripe = new stripe_1.default(configuration_1.STRIPE_KEY, { apiVersion: '2025-02-24.acacia' });
    const uploadService = new aws_upload_service_1.default(s3Config, bucketName);
    const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
    const routes = new routes_1.Routes(new user_usecase_1.UserUsecase(userRepository), new space_usecase_1.SpaceUsecase(spaceRepository, userRepository), new content_usecase_1.ContentUsecase(contentRepository, uploadService, new space_usecase_1.SpaceUsecase(spaceRepository, userRepository), new deepai_image_variant_1.DeepaiImageVariant(configuration_1.DEEP_AI_KEY, deep_ai_1.DEEP_AI_IMAGE_GEN_VARIATION), new aws_get_blob_service_1.S3GetBlobService(s3Config, bucketName), new aws_temporary_link_service_1.default(bucketName, s3Config, expDateForContent)), new stripe_usecase_1.StripeUsecase(stripe, new space_usecase_1.SpaceUsecase(spaceRepository, userRepository), new user_usecase_1.UserUsecase(userRepository)));
    const stripeController = new stripe_controller_1.StripeController(new stripe_usecase_1.StripeUsecase(stripe, new space_usecase_1.SpaceUsecase(spaceRepository, userRepository), new user_usecase_1.UserUsecase(userRepository)), stripe, configuration_1.STRIPE_WEBHOOK_SECRET);
    const contentController = new content_controller_1.ContentController(new content_usecase_1.ContentUsecase(contentRepository, uploadService, new space_usecase_1.SpaceUsecase(spaceRepository, userRepository), new openai_image_variant_1.OpenaiImageVariant(configuration_1.DEEP_AI_KEY, deep_ai_1.DEEP_AI_IMAGE_GEN_VARIATION), new aws_get_blob_service_1.S3GetBlobService(s3Config, bucketName), new aws_temporary_link_service_1.default(bucketName, s3Config, expDateForContent)));
    const allowedOrigins = [
        new URL(configuration_1.COMPANY_DOMAIN).origin
    ];
    exports.app.use((0, helmet_1.default)());
    exports.app.post(api_routes_1.STRIPE_PATH + api_routes_1.WEBHOOK_PATH, express_1.default.raw({ type: 'application/json' }), stripeController.webhook.bind(stripeController));
    (0, swagger_doc_1.setupSwagger)(exports.app);
    (0, create_swagger_yaml_1.default)(swagger_doc_1.swaggerSpec);
    exports.app.use((0, cors_1.default)({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', "x-api-key"],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    }));
    exports.app.use(express_1.default.json());
    exports.app.post('/api/v1' + api_routes_1.CONTENT_PATH + api_routes_1.UPLOAD_PATH, upload.array('files', 10), (0, authentication_middleware_1.default)(configuration_1.TOKEN_SECRET, new jwt_token_service_1.JwtTokenService(), true), content_routes_1.validateUploadEndpoint, (0, verify_upload_content_1.default)(spaceRepository, userRepository), (0, authorization_middleware_1.default)(verify_upload_content_1.verifyUploadPermissions), contentController.upload.bind(contentController));
    exports.app.options(api_routes_1.CONTENT_VIEW_PATH + '/*', rate_limit_1.rateLimiter, (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', configuration_1.COMPANY_DOMAIN);
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
        res.setHeader('Accept-Ranges', 'bytes');
        res.sendStatus(204);
    });
    exports.app.get(api_routes_1.CONTENT_VIEW_PATH + '/*', contentController.redirectToS3(configuration_1.S3_BUCKET_NAME_AWS, s3Config));
    routes.register(exports.app);
    exports.app.use(error_middleware_1.default);
    return exports.app;
});
exports.initializeServer = initializeServer;
// Only start the server when not in test mode
if (process.env.NODE_ENV !== "test") {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, exports.initializeServer)();
        exports.app.listen(configuration_1.PORT, () => {
            console.log(`🚀 Server running on port: ${configuration_1.PORT}`);
        });
    }))();
}
// CRON Job for upkeep
node_cron_1.default.schedule("*/5 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    //
}));
