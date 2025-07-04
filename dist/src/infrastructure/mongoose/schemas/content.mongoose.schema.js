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
exports.ContentModel = exports.ContentSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const schema_names_1 = require("../../../domain/constants/schema.names");
const generate_uuid_util_1 = require("../../../utils/generate.uuid.util");
exports.ContentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    key: { type: String, required: true },
    mimeType: { type: String, required: true },
    location: { type: String, required: true },
    locationExpiration: { type: Date, required: false },
    uploadCompletion: { type: Number, required: true, default: 0 },
    uploadError: { type: String, required: false },
    spaceId: { type: String, required: true },
    downloadUrl: { type: String, required: false },
    length: { type: Number, required: false },
    size: { type: Number, required: true },
    height: { type: Number, required: false },
    width: { type: Number, required: false },
    ai: { type: Boolean, required: false, default: false },
    favorite: { type: Boolean, required: false, default: false },
    clientId: { type: String, unique: true, default: () => (0, generate_uuid_util_1.generateUuid)() },
    deactivatedAt: { type: Date, required: false, default: null },
}, { timestamps: true });
exports.ContentModel = mongoose_1.default.model(schema_names_1.CONTENT_SCHEMA, exports.ContentSchema);
