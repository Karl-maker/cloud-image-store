import { Connection, Document, Model } from "mongoose";
import { Persistent } from "../../../domain/entities/persistent";
import { Repository } from "../../../domain/repositories/repository";
import { DeleteResponse, FindParams, FindResponse } from "../../../domain/types/repository";
import { mapFindMongooseFilters } from "../../../utils/map.find.mongoose.filters.util";
import { mapFindMongooseSort } from "../../../utils/map.find.mongoose.sort.util";
import { mapFindMongoosePagination } from "../../../utils/map.find.mongoose.pagniation.util";


export abstract class MongooseRepository<
    D extends Document, 
    E extends Persistent, 
    SortByKeys, 
    FilterByKeys
    > implements Repository<E, SortByKeys, FilterByKeys> {
    protected readonly model: Model<D>;

    constructor(protected readonly db: Connection, schemaName: string, schema: any) {
        this.model = db.model<D>(schemaName, schema);
    }

    async findById(id: string) : Promise<E | null> {
        const found = await this.model.findOne({
            clientId: id,
            deactivatedAt: null
        })
        return found ? this.mapModelToEntity(found) : null;
    }

    async findMany(params?: FindParams<SortByKeys, FilterByKeys>): Promise<FindResponse<E>> {
        const deactivatedFilter = { deactivatedAt: null };

        const filters = {
            ...mapFindMongooseFilters(params?.filters),
            ...deactivatedFilter,
        };
    
        const paginationOptions = mapFindMongoosePagination(params?.pageNumber, params?.pageSize);
        const sortOptions = mapFindMongooseSort(params?.sortBy, params?.sortOrder);
    
        const result = await this.model.find({
            ...filters
        }, {}, { sort: sortOptions, ...paginationOptions });
    
        const totalItems = await this.model.countDocuments(filters);
        const pageSize = params?.pageSize ?? totalItems; 
        const currentPage = params?.pageNumber ?? 1;
        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            data: result.map((d) => this.mapModelToEntity(d)),
            pagination: {
                totalItems,
                totalPages,
                currentPage,
                pageSize,
            },
        };
    }    

    async findManyIgnoreDeletion(params?: FindParams<SortByKeys, FilterByKeys>): Promise<FindResponse<E>> {

        const filters = {
            ...mapFindMongooseFilters(params?.filters),
        };
    
        const paginationOptions = mapFindMongoosePagination(params?.pageNumber, params?.pageSize);
        const sortOptions = mapFindMongooseSort(params?.sortBy, params?.sortOrder);
    
        const result = await this.model.find({
            ...filters
        }, {}, { sort: sortOptions, ...paginationOptions });
    
        const totalItems = await this.model.countDocuments(filters);
        const pageSize = params?.pageSize ?? totalItems; 
        const currentPage = params?.pageNumber ?? 1;
        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            data: result.map((d) => this.mapModelToEntity(d)),
            pagination: {
                totalItems,
                totalPages,
                currentPage,
                pageSize,
            },
        };
    }  

    async save(d: E): Promise<E> {
        
        if (d.id) {
            const updated = await this.model.findOneAndUpdate(
                { clientId: d.id }, 
                d, 
                { new: true } 
            );
            if(!updated) throw new Error('Issue updating data');
            return this.mapModelToEntity(updated) 
        }

        const saved = await this.model.create(d);
        return this.mapModelToEntity(saved)
    }

    async delete(data: E): Promise<DeleteResponse<E>> {
        let error : Error | undefined = undefined;

        const deleted = await this.model.findOneAndDelete({
            clientId: data.id
        });

        return {
            data,
            error
        }
    }

    private mapModelToEntity (d: any): E {
        const savedObj = {
            ...d.toObject(),
            id: d.clientId
        } as unknown as any;

        delete savedObj['_id'];
        delete savedObj['__v'];
        delete savedObj['clientId'];

        return savedObj as E;
    }
}
