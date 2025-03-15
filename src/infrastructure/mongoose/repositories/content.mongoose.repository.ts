import { Connection } from "mongoose";
import { MongooseRepository } from "./mongoose.repository";
import { CONTENT_SCHEMA } from "../../../domain/constants/schema.names";
import { ContentDocument, ContentSchema } from "../schemas/content.mongoose.schema";
import { Content } from "../../../domain/entities/content";
import { ContentFilterBy, ContentSortBy } from "../../../domain/types/content";
import { ContentRepository } from "../../../domain/repositories/content.repository";


export class ContentMongooseRepository extends MongooseRepository<
    ContentDocument, 
    Content, 
    ContentSortBy, 
    ContentFilterBy
    > implements ContentRepository {
    constructor(db: Connection) {
        super(db, CONTENT_SCHEMA, ContentSchema)
    }

}
