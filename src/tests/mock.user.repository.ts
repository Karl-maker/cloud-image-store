import { UserRepository } from "../domain/repositories/user.repository";
import { User } from "../domain/entities/user";
import { UserFilterBy, UserSortBy } from "../domain/types/user";
import { FindParams, FindResponse, DeleteResponse } from "../domain/types/repository";

export class MockUserRepository implements UserRepository {
    private users: User[] = [];

    async save(entity: User): Promise<User> {
        const idx = this.users.findIndex(u => u.id === entity.id);
        if (idx !== -1) {
            this.users[idx] = entity;
        } else {
            this.users.push(entity);
        }
        return entity;
    }

    async findMany(params?: FindParams<UserSortBy, UserFilterBy>): Promise<FindResponse<User>> {
        // For simplicity, ignore filters/sort for now
        const pageNumber = params?.pageNumber || 1;
        const pageSize = params?.pageSize || this.users.length;
        
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = this.users.slice(startIndex, endIndex);
        
        const totalPages = Math.ceil(this.users.length / pageSize);
        
        return {
            data: paginatedUsers,
            pagination: {
                totalItems: this.users.length,
                totalPages: totalPages,
                currentPage: pageNumber,
                pageSize: pageSize
            }
        };
    }

    async findManyIgnoreDeletion(params?: FindParams<UserSortBy, UserFilterBy>): Promise<FindResponse<User>> {
        return this.findMany(params);
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find(u => u.id === id) || null;
    }

    async delete<E>(data: User): Promise<DeleteResponse<User>> {
        const idx = this.users.findIndex(u => u.id === data.id);
        if (idx !== -1) {
            this.users.splice(idx, 1);
            return { data };
        }
        return { data };
    }
} 