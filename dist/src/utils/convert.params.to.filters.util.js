"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToFilters = convertToFilters;
function convertToFilters(obj) {
    const filters = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value === "string") {
                if (key.endsWith("Id") || key.endsWith("Ids")) {
                    filters[key] = { exact: value }; // Exact match for keys ending in "Id"
                }
                else if (value === 'true' || value === 'false') {
                    filters[key] = { exact: value };
                }
                else {
                    filters[key] = { contains: value }; // Contains for regular strings
                }
            }
            else {
                filters[key] = { exact: value }; // Default to exact for other types
            }
        }
    }
    return filters;
}
