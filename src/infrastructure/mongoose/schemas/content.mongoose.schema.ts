import mongoose, { Schema, Document } from "mongoose";
import { CONTENT_SCHEMA } from "../../../domain/constants/schema.names";
import { generateUuid } from "../../../utils/generate.uuid.util";
import { Content } from "../../../domain/entities/content";

export interface ContentDocument extends Omit<Content, 'id'>, Document {
    clientId?: string;
}

export const ContentSchema = new Schema<ContentDocument>(
    {
        name: { type: String, required: true },
        description: { type: String, required: false },
        key: { type: String, required: true },
        mimeType: { type: String, required: true },
        location: { type: String, required: true },
        uploadCompletion: { type: Number, required: true, default: 0 },
        uploadError: { type: String, required: false },
        spaceId: { type: String, required: true },
        length: { type: Number, required: false },
        size: { type: Number, required: true },
        height: { type: Number, required: false },
        width: { type: Number, required: false },
        ai: { type: Boolean, required: false, default: false },
        favorite: { type: Boolean, required: false, default: false },
        clientId: { type: String, unique: true, default: () => generateUuid() }
    },
    { timestamps: true }
);

export const ContentModel = mongoose.model<ContentDocument>(CONTENT_SCHEMA, ContentSchema);
