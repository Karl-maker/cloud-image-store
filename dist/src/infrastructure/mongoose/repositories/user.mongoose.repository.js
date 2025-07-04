"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMongooseRepository = void 0;
const mongoose_repository_1 = require("./mongoose.repository");
const user_mongoose_schema_1 = require("../schemas/user.mongoose.schema");
const schema_names_1 = require("../../../domain/constants/schema.names");
class UserMongooseRepository extends mongoose_repository_1.MongooseRepository {
    constructor(db) {
        super(db, schema_names_1.USER_SCHEMA, user_mongoose_schema_1.UserSchema);
    }
}
exports.UserMongooseRepository = UserMongooseRepository;
