import { HttpException } from "./http.exception";

export class UnauthorizedException extends HttpException {
    constructor(message: string) {
        super("Unauthorized", message, 401);
    }
}