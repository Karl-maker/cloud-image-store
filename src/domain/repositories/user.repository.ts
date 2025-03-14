import { User } from "../entities/user";
import { UserFilterBy, UserSortBy } from "../types/user";
import { Repository } from "./repository";

export interface UserRepository extends Repository<
    User,
    UserSortBy,
    UserFilterBy
> {}