export class HttpException extends Error {
    code : number;
    
    constructor(name: string, message: string, code: number) {
        super(message);
        this.name = name; // Important for error handler
        this.code = code;
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}
