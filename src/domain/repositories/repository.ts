import { Persistent } from "../entities/persistent";
import { DeleteResponse, FindParams, FindResponse } from "../types/repository";

export interface Repository<
    P extends Persistent, 
    SortByKeys, 
    FilterByKeys
    > {
    save(entity: P): Promise<P>;
    findMany(params?: FindParams<SortByKeys, FilterByKeys>): Promise<FindResponse<P>>;
    findManyIgnoreDeletion(params?: FindParams<SortByKeys, FilterByKeys>): Promise<FindResponse<P>>;
    findById(id: string): Promise<P | null>;
    delete<E>(data: P): Promise<DeleteResponse<P>>;
}