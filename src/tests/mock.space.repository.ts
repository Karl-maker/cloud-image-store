import { SpaceRepository } from "../domain/repositories/space.repository";
import { Space } from "../domain/entities/space";
import { SpaceFilterBy, SpaceSortBy } from "../domain/types/space";
import { FindParams, FindResponse, DeleteResponse } from "../domain/types/repository";

export class MockSpaceRepository implements SpaceRepository {
    private spaces: Space[] = [];

    async save(entity: Space): Promise<Space> {
        const idx = this.spaces.findIndex(s => s.id === entity.id);
        if (idx !== -1) {
            this.spaces[idx] = entity;
        } else {
            this.spaces.push(entity);
        }
        return entity;
    }

    async findMany(params?: FindParams<SpaceSortBy, SpaceFilterBy>): Promise<FindResponse<Space>> {
        return {
            data: [...this.spaces],
            pagination: {
                totalItems: this.spaces.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: this.spaces.length
            }
        };
    }

    async findManyIgnoreDeletion(params?: FindParams<SpaceSortBy, SpaceFilterBy>): Promise<FindResponse<Space>> {
        return this.findMany(params);
    }

    async findById(id: string): Promise<Space | null> {
        return this.spaces.find(s => s.id === id) || null;
    }

    async delete<E>(data: Space): Promise<DeleteResponse<Space>> {
        const idx = this.spaces.findIndex(s => s.id === data.id);
        if (idx !== -1) {
            this.spaces.splice(idx, 1);
            return { data };
        }
        return { data };
    }

    async addUsedMegabytes(id: string, amount: number): Promise<boolean> {
        const space = this.spaces.find(s => s.id === id);
        if (space) {
            (space as any).usedMegabytes = ((space as any).usedMegabytes || 0) + amount;
            return true;
        }
        return false;
    }
} 