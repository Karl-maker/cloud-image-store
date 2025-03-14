import { QueryOptions } from "mongoose";

export const mapFindMongoosePagination = (
  pageNumber?: number,
  pageSize?: number
): Pick<QueryOptions, "skip" | "limit"> => {
  if (pageNumber === undefined || pageSize === undefined) return {};

  const safePageSize = Math.abs(pageSize); // Ensure pageSize is positive
  return {
    skip: (pageNumber - 1) * safePageSize,
    limit: safePageSize,
  };
};
 