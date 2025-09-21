import { Link } from "../entities/link";

export type LinkSortBy = Omit<Link, 'id'>;
export type LinkFilterBy = Omit<Link, 'id'>;
export type LinkCreatedEvent = {
    link: Link;
};