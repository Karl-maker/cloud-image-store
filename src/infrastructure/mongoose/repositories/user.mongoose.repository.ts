import { Connection } from "mongoose";
import { MongooseRepository } from "./mongoose.repository";
import { UserDocument, UserSchema } from "../schemas/mongoose.schema";
import { User } from "../../../domain/entities/user";
import { UserFilterBy, UserSortBy } from "../../../domain/types/user";
import { USER_SCHEMA } from "../../../domain/constants/schema.names";
import { UserRepository } from "../../../domain/repositories/user.repository";


export class UserMongooseRepository extends MongooseRepository<
    UserDocument, 
    User, 
    UserSortBy, 
    UserFilterBy
    > implements UserRepository {
    constructor(db: Connection) {
        super(db, USER_SCHEMA, UserSchema)
    }

}
