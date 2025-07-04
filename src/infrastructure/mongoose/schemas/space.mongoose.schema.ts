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
        deactivatedAt: { type: Date, required: false, default: null },
        usedMegabytes: { type: Number, required: true, min: 0, default: 0 },
        shareType: { type: String, default: 'public' },
        clientId: { type: String, unique: true, default: () => generateUuid() }
    },
    { timestamps: true }
);

// Add comprehensive indexes for optimal query performance
SpaceSchema.index({ clientId: 1 }, { unique: true }); // Primary lookup by clientId
SpaceSchema.index({ createdByUserId: 1 }); // Spaces by creator (most common query)
SpaceSchema.index({ deactivatedAt: 1 }); // Filter active/inactive spaces
SpaceSchema.index({ shareType: 1 }); // Filter by share type
SpaceSchema.index({ usedMegabytes: 1 }); // Sort by storage usage
SpaceSchema.index({ createdAt: -1 }); // Sort by creation date
SpaceSchema.index({ updatedAt: -1 }); // Sort by update date

// Compound indexes for common query patterns
SpaceSchema.index({ createdByUserId: 1, deactivatedAt: 1 }); // Active spaces by creator
SpaceSchema.index({ createdByUserId: 1, shareType: 1 }); // Spaces by type and creator
SpaceSchema.index({ createdByUserId: 1, createdAt: -1 }); // Recent spaces by creator
SpaceSchema.index({ deactivatedAt: 1, shareType: 1 }); // Active spaces by type
SpaceSchema.index({ usedMegabytes: 1, deactivatedAt: 1 }); // Storage usage of active spaces

// Text search index for space names and descriptions
SpaceSchema.index({ 
    name: 'text', 
    description: 'text' 
}, { 
    weights: { 
        name: 10, 
        description: 5 
    },
    name: 'space_text_search'
});

// Index for user membership queries (if you query by userId in userIds array)
SpaceSchema.index({ userIds: 1 }); // Spaces containing a specific user

export const SpaceModel = mongoose.model<SpaceDocument>(SPACE_SCHEMA, SpaceSchema);
