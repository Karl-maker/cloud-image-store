import { Persistent } from "../entities/persistent";
import { FindResponse } from "./repository";

export type FindManyResponse<E extends Persistent> = FindResponse<E>;