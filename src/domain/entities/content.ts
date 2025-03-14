import { Persistent } from "./persistent";

export interface Content extends Persistent {
    name: string;
    description: string | null;
    key: string;
    mimeType: string;
    location: string;
    spaceId: string;
}

