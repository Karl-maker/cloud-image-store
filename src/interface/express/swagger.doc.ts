import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Photo Cloud API Endpoints',
      version: '1.0.0',
      description: 'RESTful API Docs',
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key needed to access endpoints",
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    servers: [
      {
        url: '/api/v1',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../../**/*.js'), 
    path.join(__dirname, '../../**/*.ts'), 
], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
