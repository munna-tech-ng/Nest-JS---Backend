import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { BaseException } from "./base.exception";
import { BaseMaper } from "../dto/base.maper.dto";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

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
            // Check if this is a Fastify multipart error (client error, not server error)
            const isFastifyMultipartError = 
                exception.message?.includes("the request is not multipart") ||
                (exception.name === "FastifyError" && exception.message?.includes("multipart"));
            
            if (isFastifyMultipartError) {
                statusCode = HttpStatus.BAD_REQUEST;
                title = "Bad Request";
                message = "Request must be multipart/form-data for file upload";
                errorData = {
                    code: "INVALID_CONTENT_TYPE",
                    name: exception.name,
                };
            } else {
                statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                title = "Internal Server Error";
                message = exception.message || "An unexpected error occurred";
                errorData = {
                    code: "INTERNAL_SERVER_ERROR",
                    name: exception.name,
                };
            }
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

        // Check if this is a Fastify multipart error (expected when non-multipart request tries to use file())
        const isFastifyMultipartError = 
            exception instanceof Error &&
            (exception.message?.includes("the request is not multipart") ||
             exception.name === "FastifyError" && exception.message?.includes("multipart"));

        // Log only unexpected errors (5xx) or exceptions that explicitly should be logged
        const shouldLog = 
            exception instanceof BaseException 
                ? exception.shouldLog 
                : statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

        if (isFastifyMultipartError) {
            // Log Fastify multipart errors as info (expected behavior when content-type doesn't match)
            this.logger.debug(
                `Multipart request expected but received ${request.headers['content-type'] || 'unknown content-type'}: ${message} - ${request.method} ${request.url}`,
            );
        } else if (shouldLog) {
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

        // Fastify response API: use code() and send()
        response.code(statusCode).send(errorResponse);
    }
}