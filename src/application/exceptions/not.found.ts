import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {
    constructor(message: string) {
        super('Not Found', message, 404)
    }
}