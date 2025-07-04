"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceMongooseRepository = void 0;
const mongoose_repository_1 = require("./mongoose.repository");
const schema_names_1 = require("../../../domain/constants/schema.names");
const space_mongoose_schema_1 = require("../schemas/space.mongoose.schema");
class SpaceMongooseRepository extends mongoose_repository_1.MongooseRepository {
    constructor(db) {
        super(db, schema_names_1.SPACE_SCHEMA, space_mongoose_schema_1.SpaceSchema);
    }
    addUsedMegabytes(id, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.updateOne({ clientId: id }, { $inc: { usedMegabytes: amount } });
            return result.modifiedCount > 0;
        });
    }
}
exports.SpaceMongooseRepository = SpaceMongooseRepository;
