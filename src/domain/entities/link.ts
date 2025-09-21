import { Persistent } from "./persistent";

export interface Link extends Persistent {
    token: string;
    spaceId: string;
    deactivatedAt?: Date;
}

