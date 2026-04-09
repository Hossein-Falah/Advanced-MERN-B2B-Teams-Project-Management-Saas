import { Response } from "express";
import { ApiResponse } from "./api-response";

export class ResponseHandler {
    static send<T, M = any>(
        res: Response,
        options: {
            success?: boolean;
            code?: string;
            statusCode?: number;
            message?: string;
            data?: T | null;
            meta?: M;
        }
    ) {
        const response = new ApiResponse<T, M>(options);

        return res.status(response.statusCode).json(response);
    }
}
