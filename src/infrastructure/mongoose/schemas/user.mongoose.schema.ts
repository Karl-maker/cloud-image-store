import mongoose, { Schema, Document } from "mongoose";
import { User } from "../../../domain/entities/user";
import { USER_SCHEMA } from "../../../domain/constants/schema.names";
import { generateUuid } from "../../../utils/generate.uuid.util";

export interface UserDocument extends Omit<User, 'id'>, Document {
    clientId?: string;
}

export const UserSchema = new Schema<UserDocument>(
    {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        clientId: { type: String, unique: true, default: () => generateUuid() },
        stripeId: { type: String, required: false, default: null },
        email: { type: String, required: true, unique: true },
        hashPassword: { type: String, required: true },
        salt: { type: String, required: true },
        confirmed: { type: Boolean, required: true, default: false },
        lastPasswordUpdate: { type: Date, required: false }
    },
    { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>(USER_SCHEMA, UserSchema);
