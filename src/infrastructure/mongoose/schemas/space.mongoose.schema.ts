import mongoose, { Schema, Document } from "mongoose";
import { SPACE_SCHEMA } from "../../../domain/constants/schema.names";
import { generateUuid } from "../../../utils/generate.uuid.util";
import { Space } from "../../../domain/entities/space";

export interface SpaceDocument extends Omit<Space, 'id'>, Document {
    clientId?: string;
}

export const SpaceSchema = new Schema<SpaceDocument>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        userIds: { type: [String], required: true },
        createdByUserId: { type: String, required: true },
        pausedAt: { type: Date, default: null },
        deactivatedAt: { type: Date, default: null },
        usedMegabytes: { type: Number, required: true, min: 0 },
        totalMegabytes: { type: Number, required: true, min: 1 },
        subscriptionPlanId: { type: String, required: true },
        clientId: { type: String, unique: true, default: () => generateUuid() },
    },
    { timestamps: true }
);

export const SpaceModel = mongoose.model<SpaceDocument>(SPACE_SCHEMA, SpaceSchema);
