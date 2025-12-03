import { HttpStatus } from "@nestjs/common";

export interface ErrorData {
    code?: string;
    field?: string;
    details?: any;
    [key: string]: any;
}

export class BaseException extends Error {
    public readonly statusCode: HttpStatus;
    public readonly title: string;
    public readonly error: boolean = true;
    public readonly data: ErrorData;

    constructor(
        message: string,
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        title: string = "Error",
        data: ErrorData = {},
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.title = title;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}

