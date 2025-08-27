import { NotFoundException } from "../../application/exceptions/not.found";
import { FindManyDTO } from "../interfaces/presenters/dtos/find.many.dto";
import { convertToFilters } from "../../utils/convert.params.to.filters.util";
import { Persistent } from "../entities/persistent";
import { Repository } from "../repositories/repository";
import { FindParams } from "../types/repository";
import { FindManyResponse } from "../types/usecase";

export abstract class Usecases<Entity extends Persistent, SortByKeys, FilterByKeys, R extends Repository<Entity, SortByKeys, FilterByKeys>> {
    constructor (public repository: R) {}

    async create <CreateDTO>(data: CreateDTO) : Promise<Entity> {
        const entity: Entity = await this.mapCreateDtoToEntity(data)
        const saved = await this.repository.save(entity);
        return saved;
    }

    async update <UpdateDTO>(id: string, data: UpdateDTO) : Promise<Entity> {
        const found = await this.repository.findById(id);
        if(!found) throw new NotFoundException('No item found to update')
        const entity: Entity = await this.mapUpdateDtoToEntity(data, found);
        entity.id = id;
        const saved = await this.repository.save(entity);
        return saved;
    }

    async findById (id: string) : Promise<Entity> {
        const data = await this.repository.findById(id);

        if(!data) throw new NotFoundException('Item not found with id');

        return data;
    }

    async findMany <F extends FindManyDTO<SortByKeys>>(params: F) : Promise<FindManyResponse<Entity>> {

        const input : FindParams<SortByKeys, FilterByKeys> = {
            pageNumber: params.page_number,
            pageSize: params.page_size,
            sortBy: params.by,
            sortOrder: params.order,
        }
        
        const objectParams = params as any;

        delete objectParams['page_number'];
        delete objectParams['page_size'];
        delete objectParams['by'];
        delete objectParams['order'];

        // assume everything else is filters;

        const filters = convertToFilters<FilterByKeys>(objectParams as FilterByKeys);

        input.filters = filters;

        const data = await this.repository.findMany(
            input
        );

        return data;
    }

    async deleteById (id: string) : Promise<void> {
        const found = await this.repository.findById(id);
        if(!found) throw new NotFoundException('Item not found with id');
        
        const deleted = await this.repository.delete(found)
        if(deleted.error) throw deleted.error;
    }

    abstract mapCreateDtoToEntity(data: unknown) : Promise<Entity>;
    abstract mapUpdateDtoToEntity(data: unknown, entity: Entity) : Promise<Entity>;
}