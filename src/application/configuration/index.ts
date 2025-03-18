import dotenv from 'dotenv';

dotenv.config();

export const COMPANY_NAME = process.env.COMPANY_NAME;
export const COMPANY_DOMAIN = process.env.COMPANY_DOMAIN;
export const PEPPER = process.env.PEPPER;
export const API_KEY_SECRET = process.env.API_KEY_SECRET;
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const CONFIRMATION_SECRET = process.env.CONFIRMATION_SECRET;
export const REGION_AWS = process.env.REGION_AWS;
export const ACCESS_KEY_ID_AWS = process.env.ACCESS_KEY_ID_AWS;
export const SECRET_ACCESS_KEY_AWS = process.env.SECRET_ACCESS_KEY_AWS;
export const S3_BUCKET_NAME_AWS = process.env.S3_BUCKET_NAME_AWS;
export const EMAIL_NO_REPLY_PASS = process.env.EMAIL_NO_REPLY_PASS;
export const EMAIL_NO_REPLY_USER = process.env.EMAIL_NO_REPLY_USER;
export const EMAIL_NO_REPLY_SERVICE = process.env.EMAIL_NO_REPLY_SERVICE;
export const MY_DOMAIN = process.env.MY_DOMAIN;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_KEY = process.env.STRIPE_KEY;