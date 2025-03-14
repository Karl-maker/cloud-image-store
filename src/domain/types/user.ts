import { User } from "../entities/user";

export type UserSortBy = Omit<User, 'id' | 'hashPassword' | 'confirmed' | 'salt'>;
export type UserFilterBy = Omit<User, 'id' | 'hashPassword' | 'salt'>;
export type UserCreatedEvent = {
    user: User;
};