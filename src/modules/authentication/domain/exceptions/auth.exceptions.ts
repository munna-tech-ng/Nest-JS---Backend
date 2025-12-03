import { HttpStatus } from "@nestjs/common";
import { BaseException } from "src/core/exceptions/base.exception";

export class UserAlreadyExistsException extends BaseException {
    constructor(email?: string) {
        super(
            "User with this email already exists",
            HttpStatus.CONFLICT,
            "User Already Exists",
            {
                code: "USER_ALREADY_EXISTS",
                field: "email",
                email: email,
            },
        );
    }
}

export class InvalidCredentialsException extends BaseException {
    constructor() {
        super(
            "Invalid credentials",
            HttpStatus.UNAUTHORIZED,
            "Authentication Failed",
            {
                code: "INVALID_CREDENTIALS",
            },
        );
    }
}

export class UserNotFoundException extends BaseException {
    constructor(userId?: string) {
        super(
            "User not found",
            HttpStatus.NOT_FOUND,
            "User Not Found",
            {
                code: "USER_NOT_FOUND",
                userId: userId,
            },
        );
    }
}

export class UnsupportedAuthMethodException extends BaseException {
    constructor(method?: string) {
        super(
            "Unsupported authentication method",
            HttpStatus.BAD_REQUEST,
            "Invalid Authentication Method",
            {
                code: "UNSUPPORTED_AUTH_METHOD",
                method: method,
            },
        );
    }
}

export class InvalidTokenException extends BaseException {
    constructor() {
        super(
            "Invalid or expired token",
            HttpStatus.UNAUTHORIZED,
            "Token Validation Failed",
            {
                code: "INVALID_TOKEN",
            },
        );
    }
}

export class FirebaseUserEmailNotFoundException extends BaseException {
    constructor() {
        super(
            "Firebase user email not found",
            HttpStatus.BAD_REQUEST,
            "Firebase Authentication Error",
            {
                code: "FIREBASE_EMAIL_NOT_FOUND",
            },
        );
    }
}

