import { Content } from "../entities/content";

export type ContentSortBy = Omit<Content, 'id' | 'location' | 'key'>;
export type ContentFilterBy = Omit<Content, 'id'>;
export type ContentCreatedEvent = {
    content: Content;
};