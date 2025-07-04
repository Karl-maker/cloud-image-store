"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentMongooseRepository = void 0;
const mongoose_repository_1 = require("./mongoose.repository");
const schema_names_1 = require("../../../domain/constants/schema.names");
const content_mongoose_schema_1 = require("../schemas/content.mongoose.schema");
class ContentMongooseRepository extends mongoose_repository_1.MongooseRepository {
    constructor(db) {
        super(db, schema_names_1.CONTENT_SCHEMA, content_mongoose_schema_1.ContentSchema);
    }
}
exports.ContentMongooseRepository = ContentMongooseRepository;
