"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceModel = exports.SpaceSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const schema_names_1 = require("../../../domain/constants/schema.names");
const generate_uuid_util_1 = require("../../../utils/generate.uuid.util");
exports.SpaceSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    userIds: { type: [String], required: true },
    createdByUserId: { type: String, required: true },
    deactivatedAt: { type: Date, required: false, default: null },
    usedMegabytes: { type: Number, required: true, min: 0, default: 0 },
    shareType: { type: String, default: 'public' },
    clientId: { type: String, unique: true, default: () => (0, generate_uuid_util_1.generateUuid)() }
}, { timestamps: true });
exports.SpaceModel = mongoose_1.default.model(schema_names_1.SPACE_SCHEMA, exports.SpaceSchema);
