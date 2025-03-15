import { Content } from "../entities/content";
import { ContentFilterBy, ContentSortBy } from "../types/content";
import { Repository } from "./repository";

export interface ContentRepository extends Repository<
    Content,
    ContentSortBy,
    ContentFilterBy
> {}