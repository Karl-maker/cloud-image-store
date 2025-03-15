import { Persistent } from "./persistent";

export interface User extends Persistent {
    first_name: string;
    last_name: string;
    email: string;
    hashPassword: string;
    salt: string;
    confirmed: boolean;
    stripeId: string | null;
    lastPasswordUpdate?: Date;
}