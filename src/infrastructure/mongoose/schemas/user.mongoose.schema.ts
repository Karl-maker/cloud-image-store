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
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>(USER_SCHEMA, UserSchema);
