import { HttpException } from "./http.exception";

export class LimitReachedException extends HttpException {
    constructor(message: string) {
        super('Limit Reached', message, 403)
    }
}