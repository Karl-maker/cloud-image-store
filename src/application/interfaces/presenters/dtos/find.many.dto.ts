import { SortOrder } from "../../../../domain/types/repository";

export interface FindManyDTO<SortByKeys> {
    page_size: number;
    page_number: number;
    order: SortOrder;
    by: keyof SortByKeys;
}