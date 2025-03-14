import dotenv from 'dotenv';

dotenv.config();

export const COMPANY_NAME = process.env.COMPANY_NAME;
export const COMPANY_DOMAIN = process.env.COMPANY_DOMAIN;
export const PEPPER = process.env.PEPPER;
export const API_KEY_SECRET = process.env.API_KEY_SECRET;
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;