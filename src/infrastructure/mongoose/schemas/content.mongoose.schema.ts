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
        clientId: { type: String, unique: true, default: () => generateUuid() },
        deactivatedAt: { type: Date, required: false, default: null },
    },
    { timestamps: true }
);

// Add comprehensive indexes for optimal query performance
ContentSchema.index({ clientId: 1 }, { unique: true }); // Primary lookup by clientId
ContentSchema.index({ spaceId: 1 }); // Content by space (most common query)
ContentSchema.index({ deactivatedAt: 1 }); // Filter active/inactive content
ContentSchema.index({ mimeType: 1 }); // Filter by file type
ContentSchema.index({ ai: 1 }); // Filter AI-generated content
ContentSchema.index({ favorite: 1 }); // Filter favorite content
ContentSchema.index({ size: 1 }); // Sort by file size
ContentSchema.index({ createdAt: -1 }); // Sort by creation date
ContentSchema.index({ updatedAt: -1 }); // Sort by update date
ContentSchema.index({ uploadCompletion: 1 }); // Filter by upload status
ContentSchema.index({ uploadError: 1 }); // Filter failed uploads

// Compound indexes for common query patterns
ContentSchema.index({ spaceId: 1, deactivatedAt: 1 }); // Active content in space
ContentSchema.index({ spaceId: 1, mimeType: 1 }); // Content by type in space
ContentSchema.index({ spaceId: 1, ai: 1 }); // AI content in space
ContentSchema.index({ spaceId: 1, favorite: 1 }); // Favorite content in space
ContentSchema.index({ spaceId: 1, createdAt: -1 }); // Recent content in space
ContentSchema.index({ deactivatedAt: 1, mimeType: 1 }); // Active content by type
ContentSchema.index({ ai: 1, createdAt: -1 }); // Recent AI content
ContentSchema.index({ uploadCompletion: 1, uploadError: 1 }); // Upload status

// Text search index for content names and descriptions
ContentSchema.index({ 
    name: 'text', 
    description: 'text' 
}, { 
    weights: { 
        name: 10, 
        description: 5 
    },
    name: 'content_text_search'
});

export const ContentModel = mongoose.model<ContentDocument>(CONTENT_SCHEMA, ContentSchema);
