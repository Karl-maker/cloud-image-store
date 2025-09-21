import { Connection } from "mongoose";
import { MongooseRepository } from "./mongoose.repository";
import { LINK_SCHEMA } from "../../../domain/constants/schema.names";
import { LinkDocument, LinkSchema } from "../schemas/link.mongoose.schema";
import { Link } from "../../../domain/entities/link";
import { LinkFilterBy, LinkSortBy } from "../../../domain/types/link";
import { LinkRepository } from "../../../domain/repositories/link.repository";


export class LinkMongooseRepository extends MongooseRepository<
    LinkDocument, 
    Link, 
    LinkSortBy, 
    LinkFilterBy
    > implements LinkRepository {
    constructor(db: Connection) {
        super(db, LINK_SCHEMA, LinkSchema)
    }

}
