import mongoose, { Schema, Document } from "mongoose";
import { User } from "../../../domain/entities/user";
import { USER_SCHEMA } from "../../../domain/constants/schema.names";
import { generateUuid } from "../../../utils/generate.uuid.util";

export interface UserDocument extends Omit<User, 'id'>, Document {
    clientId?: string;
}

export const UserSchema = new Schema<UserDocument>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        clientId: { type: String, unique: true, default: () => generateUuid() },
        stripeId: { type: String, required: false, default: null },
        email: { type: String, required: true, unique: true },
        hashPassword: { type: String, required: true },
        salt: { type: String, required: true },
        confirmed: { type: Boolean, required: true, default: false },
        lastPasswordUpdate: { type: Date, required: false },
        deactivatedAt: { type: Date, required: false },
        maxUsers: { type: Number, required: false, default: 0 },
        maxSpaces: { type: Number, required: false, default: 0 },
        maxStorage: { type: Number, required: false, default: 0 },
        maxAiEnhancementsPerMonth: { type: Number, required: false, default: 0 },
        subscriptionStripeId: { type: String, required: false },
        subscriptionPlanStripeId: { type: String, required: false },
        subscriptionPlanExpiresAt: { type: Date, required: false },
    },
    { timestamps: true }
);

// Add comprehensive indexes for optimal query performance
// Note: email and clientId uniqueness are handled by schema definition above
UserSchema.index({ stripeId: 1 }); // Stripe customer lookup
UserSchema.index({ confirmed: 1 }); // Filter by confirmation status
UserSchema.index({ deactivatedAt: 1 }); // Filter active/inactive users
UserSchema.index({ subscriptionStripeId: 1 }); // Subscription lookup
UserSchema.index({ subscriptionPlanStripeId: 1 }); // Plan lookup
UserSchema.index({ subscriptionPlanExpiresAt: 1 }); // Expired subscriptions
UserSchema.index({ createdAt: -1 }); // Sort by creation date
UserSchema.index({ updatedAt: -1 }); // Sort by update date

// Compound indexes for common query patterns
UserSchema.index({ confirmed: 1, deactivatedAt: 1 }); // Active confirmed users
UserSchema.index({ stripeId: 1, confirmed: 1 }); // Confirmed users with Stripe
UserSchema.index({ subscriptionPlanExpiresAt: 1, deactivatedAt: 1 }); // Expired active subscriptions

export const UserModel = mongoose.model<UserDocument>(USER_SCHEMA, UserSchema);
