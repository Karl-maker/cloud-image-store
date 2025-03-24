import { HttpException } from "./http.exception";

export class LimitReacgedException extends HttpException {
    constructor(message: string) {
        super('Limit Reached', message, 403)
    }
}