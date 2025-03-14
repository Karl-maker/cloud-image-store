export type Timeline = 'year' | 'month' | 'day' | 'week';
export type SupportedCurrenciesISO = 'usd' | 'euro';
export type Price = {
    period: Timeline;
    frequency: number;
    amount: number;
    currency: SupportedCurrenciesISO;
};
export type Feature = {
    name: string;
    included: boolean;
}