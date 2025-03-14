import { UserFilterBy, UserSortBy } from "../../../../domain/types/user";
import { FindManyDTO } from "./find.many.dto";

export type FindManyUsersDTO = UserFilterBy & FindManyDTO<UserSortBy>;