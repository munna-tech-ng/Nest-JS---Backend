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
    public readonly shouldLog: boolean;

    constructor(
        message: string,
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
        title: string = "Error",
        data: ErrorData = {},
        shouldLog: boolean = true, // Default to true for unexpected errors
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.title = title;
        this.data = data;
        // Only log unexpected errors (5xx) by default, not expected business exceptions (4xx)
        this.shouldLog = shouldLog !== undefined 
            ? shouldLog 
            : statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
        Error.captureStackTrace(this, this.constructor);
    }
}

