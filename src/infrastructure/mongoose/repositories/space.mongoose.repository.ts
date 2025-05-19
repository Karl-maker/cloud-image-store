import { Connection } from "mongoose";
import { MongooseRepository } from "./mongoose.repository";
import { SPACE_SCHEMA } from "../../../domain/constants/schema.names";
import { SpaceDocument, SpaceSchema } from "../schemas/space.mongoose.schema";
import { Space } from "../../../domain/entities/space";
import { SpaceFilterBy, SpaceSortBy } from "../../../domain/types/space";
import { SpaceRepository } from "../../../domain/repositories/space.repository";


export class SpaceMongooseRepository extends MongooseRepository<
    SpaceDocument, 
    Space, 
    SpaceSortBy, 
    SpaceFilterBy
    > implements SpaceRepository {
    constructor(db: Connection) {
        super(db, SPACE_SCHEMA, SpaceSchema)
    }

    async addUsedMegabytes(id: string, amount: number): Promise<boolean> {

        const result = await this.model.updateOne(
            { clientId: id },
            { $inc: { usedMegabytes: amount } }
        );
    
        return result.modifiedCount > 0;
    }

}
