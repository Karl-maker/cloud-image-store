import mongoose, { Schema, Document } from "mongoose";
import { LINK_SCHEMA } from "../../../domain/constants/schema.names";
import { generateUuid } from "../../../utils/generate.uuid.util";
import { Content } from "../../../domain/entities/content";
import { Link } from "../../../domain/entities/link";

export interface LinkDocument extends Omit<Link, 'id'>, Document {
    clientId?: string;
}

export const LinkSchema = new Schema<LinkDocument>(
    {
        token:  { type: String, required: true },
        spaceId: { type: String, required: true },
        clientId: { type: String, unique: true, default: () => generateUuid() },
        deactivatedAt: { type: Date, required: false, default: null },
    },
    { timestamps: true }
);

export const ContentModel = mongoose.model<LinkDocument>(LINK_SCHEMA, LinkSchema);
