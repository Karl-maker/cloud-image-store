import { HttpException } from "./http.exception";

export class InsufficentStorageException extends HttpException {
    constructor(message: string) {
        super('Insufficent Storage', message, 507)
    }
}