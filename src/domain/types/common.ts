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
 *           description: The period for the price (e.g., monthly, yearly)
 *         frequency:
 *           type: number
 *           description: Number of times the price is charged within the period
 *         amount:
 *           type: number
 *           description: Cost of the subscription in the given currency
 *         currency:
 *           type: string
 *           enum: [usd, euro]
 *           description: Currency of the price
 *       required:
 *         - period
 *         - frequency
 *         - amount
 *         - currency
 */

export type Price = {
    period: Timeline;
    frequency: number;
    amount: number;
    currency: SupportedCurrenciesISO;
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