export class AppError extends Error {
    statusCode: number;
    code: string;

    constructor(message: string, statusCode: number = 500, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class HttpException extends AppError {
    constructor(message: string, statusCode: number, code: string) {
        super(message, statusCode, code);
    }
}

export class InternalServerException extends AppError {
    constructor(
        message: string = 'Internal Server Error', 
        statusCode: number = 500, 
        code: string = 'INTERNAL_SERVER_ERROR') {
        super(message, statusCode, code);
    }
}

export class NotFoundException extends AppError {
    constructor(
        message: string = 'Not Found', 
        statusCode: number = 404, 
        code: string = 'NOT_FOUND'
    ) {
        super(message, statusCode, code);
    }
}

export class BadRequestException extends AppError {
    constructor(
        message: string = 'Bad Request', 
        statusCode: number = 400, 
        code: string = 'BAD_REQUEST'
    ) {
        super(message, statusCode, code);
    }
}

export class UnauthorizedException extends AppError {
    constructor(
        message: string = 'Unauthorized', 
        statusCode: number = 401, 
        code: string = 'UNAUTHORIZED'
    ) {
        super(message, statusCode, code);
    }
}

export class ServiceUnavailableException extends AppError {
    constructor(
        message: string = 'Service Unavailable', 
        statusCode: number = 503, 
        code: string = 'SERVICE_UNAVAILABLE'
    ) {
        super(message, statusCode, code);
    }
}
