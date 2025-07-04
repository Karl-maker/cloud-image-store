"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Photo Cloud API Endpoints',
            version: '1.0.0',
            description: 'RESTful API Docs',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Optional, but specifies that it's a JWT token
                    description: 'JWT Bearer token authentication',
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API key needed to access endpoints',
                },
            },
        },
        security: [
            {
                BearerAuth: [], // Applying BearerAuth security globally
                ApiKeyAuth: [], // You can apply both or remove one if not needed
            },
        ],
        servers: [
            {
                url: '/api/v1',
            },
        ],
    },
    apis: [
        path_1.default.join(__dirname, '../../**/*.js'),
        path_1.default.join(__dirname, '../../**/*.ts'),
    ], // Path to the API docs
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
};
exports.setupSwagger = setupSwagger;
