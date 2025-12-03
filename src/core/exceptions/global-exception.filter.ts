import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { BaseException } from "./base.exception";
import { BaseMaper } from "../dto/base.maper.dto";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode: HttpStatus;
        let title: string;
        let message: string;
        let errorData: any = {};

        // Handle custom BaseException
        if (exception instanceof BaseException) {
            statusCode = exception.statusCode;
            title = exception.title;
            message = exception.message;
            errorData = exception.data;
        }
        // Handle NestJS HttpException
        else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            title = "HTTP Exception";
            message = exception.message;
            
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                errorData = {
                    code: (exceptionResponse as any).error || "HTTP_EXCEPTION",
                    details: exceptionResponse,
                };
            } else {
                errorData = {
                    code: "HTTP_EXCEPTION",
                    details: exceptionResponse,
                };
            }
        }
        // Handle generic Error
        else if (exception instanceof Error) {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            title = "Internal Server Error";
            message = exception.message || "An unexpected error occurred";
            errorData = {
                code: "INTERNAL_SERVER_ERROR",
                name: exception.name,
            };
        }
        // Handle unknown errors
        else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            title = "Unknown Error";
            message = "An unexpected error occurred";
            errorData = {
                code: "UNKNOWN_ERROR",
            };
        }

        // Log only unexpected errors (5xx) or exceptions that explicitly should be logged
        const shouldLog = 
            exception instanceof BaseException 
                ? exception.shouldLog 
                : statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

        if (shouldLog) {
            this.logger.error(
                `${title}: ${message}`,
                exception instanceof Error ? exception.stack : undefined,
                `${request.method} ${request.url}`,
            );
        } else {
            // Log at debug level for expected business exceptions (4xx)
            this.logger.debug(
                `${title}: ${message} - ${request.method} ${request.url}`,
            );
        }

        // Build response in BaseMaper format
        const errorResponse: BaseMaper = {
            title,
            message,
            error: true,
            statusCode,
            data: errorData,
        };

        response.status(statusCode).json(errorResponse);
    }
}

