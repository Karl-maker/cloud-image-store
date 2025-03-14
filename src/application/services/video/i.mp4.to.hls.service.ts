import { ObjectDataType } from "../../../domain/types/types/object.data.type";

export default interface IMp4ToHlsService {
    convert: (key: string, cb: (err: null | Error, data?: ObjectDataType) => Promise<void>) => Promise<void>;
}