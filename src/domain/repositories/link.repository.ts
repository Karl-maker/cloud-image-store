import { Link } from "../entities/link";
import { LinkFilterBy, LinkSortBy } from "../types/link";
import { Repository } from "./repository";

export interface LinkRepository extends Repository<
    Link,
    LinkSortBy,
    LinkFilterBy
> {
}