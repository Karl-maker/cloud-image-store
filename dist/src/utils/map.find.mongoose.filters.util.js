"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFindMongooseFilters = void 0;
const mapFindMongooseFilters = (filters) => {
    if (!filters)
        return {};
    const filter = {};
    for (const key in filters) {
        if (filters[key]) {
            const { exact, contains, greater, less } = filters[key];
            if (exact !== undefined) {
                filter[key] = exact;
            }
            if (contains !== undefined && typeof contains === "string") {
                filter[key] = { $regex: contains, $options: "i" };
            }
            if (contains !== undefined && contains instanceof Date) {
                const startOfDay = new Date(Date.UTC(contains.getUTCFullYear(), contains.getUTCMonth(), contains.getUTCDate(), 0, 0, 0, 0));
                const endOfDay = new Date(Date.UTC(contains.getUTCFullYear(), contains.getUTCMonth(), contains.getUTCDate(), 23, 59, 59, 999));
                filter[key] = { $gte: startOfDay, $lt: endOfDay };
            }
            if (greater !== undefined) {
                const date = new Date(greater);
                filter[key] = { $gte: date };
            }
            if (less !== undefined) {
                const date = new Date(less);
                filter[key] = { $lt: date };
            }
        }
    }
    return filter;
};
exports.mapFindMongooseFilters = mapFindMongooseFilters;
