import { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/app-error";
import { ResponseHandler } from "../response/response-handler";
import { ZodError } from "zod";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../constants/message.constant";

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // zod validation error
    if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
        }));

        return ResponseHandler.send(res, {
            success: false,
            statusCode: HTTPSTATUS.BAD_REQUEST,
            code: MESSAGES.COMMON.VALIDATION_ERROR.code,
            message: MESSAGES.COMMON.VALIDATION_ERROR.message,
            data: errors,
        });
    }

    if (err instanceof AppError) {
        return ResponseHandler.send(res, {
            success: false,
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            data: null
        });
    }


    return ResponseHandler.send(res, {
        success: false,
        statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
        code: MESSAGES.GENERAL.INTERNAL_SERVER_ERROR.code,
        message: MESSAGES.GENERAL.INTERNAL_SERVER_ERROR.message,
        data: null
    });
};
