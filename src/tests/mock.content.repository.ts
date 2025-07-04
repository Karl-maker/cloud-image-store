import { ContentRepository } from "../domain/repositories/content.repository";
import { Content } from "../domain/entities/content";
import { ContentFilterBy, ContentSortBy } from "../domain/types/content";
import { FindParams, FindResponse, DeleteResponse } from "../domain/types/repository";

export class MockContentRepository implements ContentRepository {
    private contents: Content[] = [];

    async save(entity: Content): Promise<Content> {
        const idx = this.contents.findIndex(c => c.id === entity.id);
        if (idx !== -1) {
            this.contents[idx] = entity;
        } else {
            this.contents.push(entity);
        }
        return entity;
    }

    async findMany(params?: FindParams<ContentSortBy, ContentFilterBy>): Promise<FindResponse<Content>> {
        return {
            data: [...this.contents],
            pagination: {
                totalItems: this.contents.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: this.contents.length
            }
        };
    }

    async findManyIgnoreDeletion(params?: FindParams<ContentSortBy, ContentFilterBy>): Promise<FindResponse<Content>> {
        return this.findMany(params);
    }

    async findById(id: string): Promise<Content | null> {
        return this.contents.find(c => c.id === id) || null;
    }

    async delete<E>(data: Content): Promise<DeleteResponse<Content>> {
        const idx = this.contents.findIndex(c => c.id === data.id);
        if (idx !== -1) {
            this.contents.splice(idx, 1);
            return { data };
        }
        return { data };
    }
} 