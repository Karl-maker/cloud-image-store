export class NotFoundException extends Error {
    code: number;

    constructor(message: string) {
        super(message)
        this.name = 'Not Found'
    }
}