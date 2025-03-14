import { Space } from "../entities/space";
import { SpaceFilterBy, SpaceSortBy } from "../types/space";
import { Repository } from "./repository";

export interface SpaceRepository extends Repository<
    Space,
    SpaceSortBy,
    SpaceFilterBy
> {}