export type Timeline = 'year' | 'month' | 'day' | 'week';
export type SupportedCurrenciesISO = 'usd' | 'euro';

/**
 * @swagger
 * components:
 *   schemas:
 *     Price:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           enum: [year, month, day, week]
 *           description: The period for the price (e.g., monthly, yearly). Required for recurring payments.
 *         frequency:
 *           type: number
 *           description: Number of times the price is charged within the period. Required for recurring payments.
 *         amount:
 *           type: number
 *           description: Cost of the subscription in the given currency
 *         currency:
 *           type: string
 *           enum: [usd, euro]
 *           description: Currency of the price
 *         id:
 *           type: string
 *           description: ID for price
 *         recurring:
 *           type: boolean
 *           description: Whether this is a recurring payment. If true, period and frequency are required.
 *       required:
 *         - amount
 *         - currency
 */

export type Price = {
    id: string;
    period?: Timeline;
    frequency?: number;
    amount: number;
    currency: SupportedCurrenciesISO;
    recurring?: boolean;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Feature:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the feature
 *         included:
 *           type: boolean
 *           description: Indicates if the feature is included in the subscription
 *       required:
 *         - name
 *         - included
 */

export type Feature = {
    name: string;
    included: boolean;
};