# Stage 1: Build Stage
FROM node:22-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build  

# Copy .hbs files to the dist/src/templates folder after building
RUN mkdir -p dist/src/application/templates && cp -r src/application/templates/* dist/src/application/templates/

# Stage 2: Production Stage
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache ffmpeg
RUN npm install -g pnpm

COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/dist ./dist   

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

ENV NODE_ENV=${NODE_ENV}
ENV COMPANY_NAME = ${COMPANY_NAME}
ENV COMPANY_DOMAIN = ${COMPANY_DOMAIN}
ENV MY_DOMAIN = ${MY_DOMAIN}
ENV TOKEN_SECRET = ${TOKEN_SECRET}
ENV API_KEY_SECRET = ${API_KEY_SECRET}
ENV CONFIRMATION_SECRET = ${CONFIRMATION_SECRET}
ENV PEPPER = ${PEPPER}
ENV PORT = ${PORT}
ENV MONGO_URI = ${MONGO_URI}
ENV REGION_AWS = ${REGION_AWS}
ENV ACCESS_KEY_ID_AWS = ${ACCESS_KEY_ID_AWS}
ENV SECRET_ACCESS_KEY_AWS = ${SECRET_ACCESS_KEY_AWS}
ENV S3_BUCKET_NAME_AWS = ${S3_BUCKET_NAME_AWS}
ENV EMAIL_NO_REPLY_PASS = ${EMAIL_NO_REPLY_PASS}
ENV EMAIL_NO_REPLY_USER = ${EMAIL_NO_REPLY_USER}
ENV EMAIL_NO_REPLY_SERVICE = ${EMAIL_NO_REPLY_SERVICE}
ENV STRIPE_WEBHOOK_SECRET = ${STRIPE_WEBHOOK_SECRET}
ENV STRIPE_KEY = ${STRIPE_KEY}

COPY --from=build /app/src ./src  
COPY . . 

CMD ["sh", "-c", "pnpm start"]
