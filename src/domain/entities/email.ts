import { Persistent } from "./persistent";

export interface Email<Content> extends Persistent {
    to: string;
    from: string;
    template: string;
    content: Content;
    subject: string;
}